# Creator Kit setup for Windows.
#
# Run it from the creator-kit folder:
#   powershell -ExecutionPolicy Bypass -File setup\setup.ps1
#
# It asks what you want to make, shows everything it will install, and waits for
# your yes. Safe to run again at any time: it only installs what is missing.
#
# Without questions (for testing):
#   powershell -ExecutionPolicy Bypass -File setup\setup.ps1 -Parts both -Engine remotion -Yes
#
# Written for Windows PowerShell 5.1 (built into Windows) and PowerShell 7.

[CmdletBinding()]
param(
    [ValidateSet('reels', 'sites', 'both')][string]$Parts,
    [ValidateSet('remotion', 'hyperframes')][string]$Engine,
    [string]$Optional = '',
    [switch]$Yes
)

$ErrorActionPreference = 'Stop'
# HyperFrames sends anonymous usage data unless this is set; the kit keeps it off.
if (-not $env:HYPERFRAMES_NO_TELEMETRY) { $env:HYPERFRAMES_NO_TELEMETRY = '1' }
$Repo = Split-Path -Parent $PSScriptRoot
Set-Location $Repo

$LogDir = Join-Path $Repo 'setup\logs'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir ('setup-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')

function Write-Log([string]$Text) {
    Write-Host $Text
    Add-Content -Path $Log -Value $Text -Encoding UTF8
}

function Stop-Setup([string]$Text) {
    Write-Log ''
    Write-Log ('[X] ' + $Text)
    Write-Log ('    The full log is in ' + $Log)
    exit 1
}

# Runs a program, shows and logs its output, and stops with a plain-English
# message if it fails. (Never used with secrets: nothing here reads .env.)
# -Live: run straight in the console (for steps that ask questions; PowerShell
# pipes whole lines only, so a question would stay hidden). Output is not logged.
function Invoke-Step([string]$Label, [string]$Exe, [string[]]$Arguments, [string]$Fix, [switch]$AllowFail, [switch]$Live) {
    Write-Log ''
    Write-Log ('>> ' + $Label)
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    if ($Live) {
        & $Exe @Arguments
    } else {
        & $Exe @Arguments 2>&1 | ForEach-Object {
            $line = "$_"
            Write-Host $line
            Add-Content -Path $Log -Value $line -Encoding UTF8
        }
    }
    $code = $LASTEXITCODE
    Add-Content -Path $Log -Value ('   exit code ' + $code) -Encoding UTF8
    $ErrorActionPreference = $previous
    if ($code -ne 0 -and -not $AllowFail) { Stop-Setup ($Label + ' did not work (exit code ' + $code + '). ' + $Fix) }
    return ($code -eq 0)
}

function Update-PathFromSystem {
    # winget changes PATH for new windows only; read it again so this window sees new tools.
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = $machine + ';' + $user
}

function Get-ToolVersion([string]$Exe, [string[]]$Arguments) {
    if (-not (Get-Command $Exe -ErrorAction SilentlyContinue)) { return $null }
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { $out = (& $Exe @Arguments 2>&1 | Out-String) } catch { $out = '' }
    $ErrorActionPreference = $previous
    if ($LASTEXITCODE -ne 0) { return $null }
    return $out.Trim()
}

function Test-MinVersion([string]$Text, [int]$Major, [int]$Minor) {
    if (-not $Text) { return $false }
    $m = [regex]::Match($Text, '(\d+)\.(\d+)')
    if (-not $m.Success) { return $false }
    $a = [int]$m.Groups[1].Value
    $b = [int]$m.Groups[2].Value
    return ($a -gt $Major) -or ($a -eq $Major -and $b -ge $Minor)
}

function Test-Python {
    # "python" may be the Microsoft Store shortcut, which is not Python.
    foreach ($try in @(@('python', '--version'), @('py', '-3', '--version'))) {
        $v = Get-ToolVersion $try[0] ($try[1..($try.Length - 1)])
        if ($v -and $v -match '^Python \d' -and (Test-MinVersion $v 3 12)) { return $true }
    }
    return $false
}

# name, winget id, test
$Tools = @(
    @{ Name = 'Node.js (LTS)'; Id = 'OpenJS.NodeJS.LTS'; Test = { Test-MinVersion (Get-ToolVersion 'node' @('--version')) 22 18 } },
    @{ Name = 'Python 3.13'; Id = 'Python.Python.3.13'; Test = { Test-Python } },
    @{ Name = 'uv'; Id = 'astral-sh.uv'; Test = { [bool](Get-ToolVersion 'uv' @('--version')) } },
    @{ Name = 'ffmpeg'; Id = 'Gyan.FFmpeg'; Test = { [bool](Get-ToolVersion 'ffmpeg' @('-version')) } },
    @{ Name = 'Git'; Id = 'Git.Git'; Test = { [bool](Get-ToolVersion 'git' @('--version')) } },
    @{ Name = 'GitHub CLI'; Id = 'GitHub.cli'; Test = { [bool](Get-ToolVersion 'gh' @('--version')) } }
)

function Read-Choice([string]$Question, [string[]]$Options) {
    Write-Host ''
    Write-Host $Question
    for ($i = 0; $i -lt $Options.Length; $i++) { Write-Host ('  ' + ($i + 1) + ') ' + $Options[$i]) }
    while ($true) {
        $answer = Read-Host ('Type a number (1-' + $Options.Length + ')')
        $n = 0
        if ([int]::TryParse($answer, [ref]$n) -and $n -ge 1 -and $n -le $Options.Length) { return $n }
        Write-Host 'Please type one of the numbers shown.'
    }
}

# ---------------------------------------------------------------- questions

Write-Log '================================================'
Write-Log ' Creator Kit setup'
Write-Log '================================================'
Write-Log ('Folder: ' + $Repo)

if (-not $Parts) {
    $n = Read-Choice 'What do you want to make?' @('Reels (short videos)', 'Websites', 'Both')
    $Parts = @('reels', 'sites', 'both')[$n - 1]
}
$PartList = if ($Parts -eq 'both') { @('reels', 'sites') } else { @($Parts) }
$WantReels = $PartList -contains 'reels'
$WantSites = $PartList -contains 'sites'

if ($WantReels -and -not $Engine) {
    Write-Host ''
    Write-Host 'Remotion:    reels are built from ready-made React templates in this kit. Works today.'
    Write-Host 'HyperFrames: reels are built as animated HTML pages. Freer, one-off motion pieces.'
    $n = Read-Choice 'Which video engine?' @('Remotion', 'HyperFrames')
    $Engine = @('remotion', 'hyperframes')[$n - 1]
}
if (-not $Engine) { $Engine = 'remotion' }

# ---------------------------------------------------------------- plan

$Missing = @($Tools | Where-Object { -not (& $_.Test) })

Write-Log ''
Write-Log 'Here is what setup will do:'
Write-Log ''
if ($Missing.Count -gt 0) {
    Write-Log '  Install these programs with winget (Windows'' own installer):'
    foreach ($t in $Missing) { Write-Log ('    - ' + $t.Name) }
} else {
    Write-Log '  Programs: Node.js, Python, uv, ffmpeg, Git and GitHub CLI are already installed.'
}
Write-Log '  Install the kit''s packages (npm ci):'
if ($WantReels) {
    Write-Log '    - reel studio (Remotion, about 400 MB)'
    if ($Engine -eq 'hyperframes') { Write-Log '    - HyperFrames studio (reels/studio-hyperframes, about 60 MB)' }
    Write-Log '    - dashboard (reels/dashboard: review, calendar, numbers)'
} else { Write-Log '    - brand checker' }
if ($WantSites) { Write-Log '    - website template (sites/template)' }
Write-Log ('  Download the skills for ' + ($PartList -join ' + ') + $(if ($WantReels) { ' (' + $Engine + ')' } else { '' }) + ' from their own GitHub pages,')
Write-Log '    at the exact versions in setup\skills.lock.yaml, into .claude\skills\'
Write-Log '  Add Claude Code plugins (superpowers' + $(if ($WantSites) { ', frontend-design' } else { '' }) + ') if Claude Code is installed'
Write-Log '  Create your keys file .env from .env.example (only if you do not have one)'
Write-Log '  Run a health check and render one test picture'
Write-Log ''
Write-Log 'Nothing is posted or uploaded. No passwords or keys are asked for.'

if (-not $Yes) {
    $answer = Read-Host 'Go ahead? (y/n)'
    if ($answer -notmatch '^(y|yes)$') { Write-Log 'Stopped. Nothing was installed.'; exit 0 }
}

# ---------------------------------------------------------------- programs

if ($Missing.Count -gt 0) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Stop-Setup 'winget is not available. Install "App Installer" from the Microsoft Store, close this window, open a new PowerShell and run the setup again.'
    }
    foreach ($t in $Missing) {
        [void](Invoke-Step ('Installing ' + $t.Name) 'winget' @('install', '--id', $t.Id, '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements', '--silent') ('If Windows asked for permission, run the setup again and click Yes. You can also install ' + $t.Name + ' yourself: winget install ' + $t.Id))
        Update-PathFromSystem
        if (-not (& $t.Test)) {
            Stop-Setup ($t.Name + ' was installed, but this window cannot see it yet. Close this window, open a new PowerShell in the creator-kit folder and run the setup again.')
        }
    }
}

# ---------------------------------------------------------------- packages

$NpmFix = 'Check your internet connection and run the setup again.'
if ($WantReels) {
    [void](Invoke-Step 'Installing the reel studio packages' 'npm' @('ci', '--no-audit', '--no-fund') $NpmFix)
    $Packages = @(,@('Installing the dashboard packages', 'reels\dashboard'))
    if ($Engine -eq 'hyperframes') { $Packages += ,@('Installing the HyperFrames studio packages', 'reels\studio-hyperframes') }
    foreach ($p in $Packages) {
        Push-Location (Join-Path $Repo $p[1])
        try { [void](Invoke-Step $p[0] 'npm' @('ci', '--no-audit', '--no-fund') $NpmFix) } finally { Pop-Location }
    }
} else {
    # Sites only: the root packages without the reel studio.
    [void](Invoke-Step 'Installing the brand checker' 'npm' @('ci', '--workspaces=false', '--no-audit', '--no-fund') $NpmFix)
}
if ($WantSites) {
    Push-Location (Join-Path $Repo 'sites\template')
    try { [void](Invoke-Step 'Installing the website template packages' 'npm' @('ci', '--no-audit', '--no-fund') $NpmFix) } finally { Pop-Location }
}

# ---------------------------------------------------------------- .env

foreach ($dir in @('.', 'sites\template')) {
    if ($dir -ne '.' -and -not $WantSites) { continue }
    $example = Join-Path $Repo ($dir + '\.env.example')
    $target = Join-Path $Repo ($dir + '\.env')
    if ((Test-Path $example) -and -not (Test-Path $target)) {
        Copy-Item $example $target
        Write-Log ('Created ' + $(if ($dir -eq '.') { '.env' } else { $dir + '\.env' }) + ' (empty keys; add yours later, every key is optional).')
    }
}
if ($WantReels) {
    Write-Log ''
    Write-Log 'Optional keys in .env (open it in Notepad; paste a key after the = sign, nothing else):'
    Write-Log '  PEXELS_API_KEY   free stock video for /broll-scout: https://www.pexels.com/api/'
    Write-Log '  PIXABAY_API_KEY  more free stock video for /broll-scout: https://pixabay.com/api/docs/'
    Write-Log '                   (Wikimedia Commons needs no key; your own footage needs none)'
    Write-Log '  POSTIZ_API_KEY   lets the dashboard show your Postiz queue and numbers'
    Write-Log '  Check which keys are set at any time: npm run doctor (it never shows the keys).'
}

# ---------------------------------------------------------------- skills

$choices = @{ parts = @($PartList); engine = $Engine } | ConvertTo-Json -Compress
Set-Content -Path (Join-Path $Repo 'setup\.choices.json') -Value $choices -Encoding ASCII

$skillArgs = @('setup\skills.mjs', '--parts', ($PartList -join ','), '--engine', $Engine)
if ($Yes) { $skillArgs += '--yes' }
if ($Optional) { $skillArgs += @('--optional', $Optional) }
[void](Invoke-Step 'Installing skills' 'node' $skillArgs 'Check your internet connection and run the setup again.' -Live:(-not $Yes))

# ---------------------------------------------------------------- checks

# The test picture comes first: it downloads the browser that renders, which the health check looks for.
$SmokeFix = 'The first render downloads a small browser; check your internet connection and run the setup again.'
if ($WantReels -and $Engine -eq 'hyperframes') {
    [void](Invoke-Step 'Test picture (one frame of the HyperFrames starter reel)' 'npm' @('run', 'hf:smoke') $SmokeFix)
    Write-Log '   Saved: reels\studio-hyperframes\out\smoke'
} elseif ($WantReels) {
    [void](Invoke-Step 'Test picture (renders one frame of the starter reel)' 'npm' @('run', 'smoke') $SmokeFix)
    Write-Log '   Saved: reels\studio-remotion\out\smoke.png'
}

$Healthy = Invoke-Step 'Health check' 'node' @('setup\doctor.mjs') '' -AllowFail

if ($WantSites) {
    Push-Location (Join-Path $Repo 'sites\template')
    try {
        [void](Invoke-Step 'Test build of the website' 'npm' @('run', 'build') 'Check your internet connection (the first build downloads your fonts) and run the setup again.')
        [void](Invoke-Step 'Website SEO check' 'npm' @('run', 'check-seo') 'Open Claude Code and ask it to fix the failed checks listed above.')
    } finally { Pop-Location }
}

Write-Log ''
Write-Log '================================================'
if ($Healthy) {
    Write-Log ' Done. Creator Kit is ready.'
} else {
    Write-Log ' Almost done. The health check found something to fix:'
    Write-Log ' follow its "How to fix" lines above, then run the setup again.'
}
Write-Log '================================================'
Write-Log 'Next:'
Write-Log '  1. Open Claude Code in this folder (type "claude" here, or use the desktop app).'
Write-Log '  2. Type /brand-intake and answer the questions. It makes the kit yours.'
if ($WantReels -and $Engine -eq 'hyperframes') { Write-Log '  3. Then: npm run hf:render   (your first reel, in your colours; npm run hf:preview to watch it)' } elseif ($WantReels) { Write-Log '  3. Then: npm run starter   (your first reel, in your colours)' }
if ($WantReels) { Write-Log '     Your dashboard: npm run dashboard, then open http://localhost:5180' }
if ($WantSites) { Write-Log '  3. Then: ask Claude to run /site-builder   (your website)' }
Write-Log ''
Write-Log ('Log saved to ' + $Log)
