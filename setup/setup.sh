#!/usr/bin/env bash
# Creator Kit setup for macOS.
#
# Run it from the creator-kit folder:
#   bash setup/setup.sh
#
# It asks what you want to make, shows everything it will install, and waits for
# your yes. Safe to run again at any time: it only installs what is missing.
#
# Without questions (for testing):
#   bash setup/setup.sh --parts both --engine remotion --yes
#
# Written for the bash that ships with macOS (3.2).

set -euo pipefail

PARTS=""
ENGINE=""
OPTIONAL=""
YES=0

usage() {
  echo "Usage: bash setup/setup.sh [--parts reels|sites|both] [--engine remotion|hyperframes] [--optional a,b] [--yes]"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --parts) PARTS="${2:-}"; shift 2 ;;
    --engine) ENGINE="${2:-}"; shift 2 ;;
    --optional) OPTIONAL="${2:-}"; shift 2 ;;
    --yes|-y) YES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

case "$PARTS" in ""|reels|sites|both) ;; *) echo "--parts must be reels, sites or both"; exit 1 ;; esac
case "$ENGINE" in ""|remotion|hyperframes) ;; *) echo "--engine must be remotion or hyperframes"; exit 1 ;; esac

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

mkdir -p setup/logs
LOG="$REPO/setup/logs/setup-$(date +%Y%m%d-%H%M%S).log"

log() {
  echo "$1"
  echo "$1" >> "$LOG"
}

stop_setup() {
  log ""
  log "[X] $1"
  log "    The full log is in $LOG"
  exit 1
}

# Runs a command, shows and logs its output, and stops with a plain-English
# message if it fails. (Never used with secrets: nothing here reads .env.)
step() {
  local label="$1" fix="$2"
  shift 2
  log ""
  log ">> $label"
  set +e
  "$@" 2>&1 | tee -a "$LOG"
  local code=${PIPESTATUS[0]}
  set -e
  if [ "$code" -ne 0 ]; then
    stop_setup "$label did not work (exit code $code). $fix"
  fi
}

has() { command -v "$1" >/dev/null 2>&1; }

# major.minor of the first version number in a command's output is at least $2.$3
version_at_least() {
  local text="$1" want_major="$2" want_minor="$3" ver major minor
  ver="$(printf '%s' "$text" | grep -Eo '[0-9]+\.[0-9]+' | head -n 1 || true)"
  [ -n "$ver" ] || return 1
  major="${ver%%.*}"
  minor="${ver#*.}"
  [ "$major" -gt "$want_major" ] || { [ "$major" -eq "$want_major" ] && [ "$minor" -ge "$want_minor" ]; }
}

tool_ok() {
  case "$1" in
    node) has node && version_at_least "$(node --version 2>/dev/null)" 22 0 ;;
    python) has python3 && version_at_least "$(python3 --version 2>/dev/null)" 3 12 ;;
    uv) has uv ;;
    ffmpeg) has ffmpeg ;;
    git) has git && git --version >/dev/null 2>&1 ;;  # the Xcode stub asks to install; treat as missing
    gh) has gh ;;
  esac
}

formula() {
  case "$1" in
    node) echo "node" ;;
    python) echo "python@3.13" ;;
    *) echo "$1" ;;
  esac
}

ask_choice() {  # question, then options; prints the chosen number
  local question="$1" n i answer
  shift
  echo "" >&2
  echo "$question" >&2
  i=1
  for opt in "$@"; do echo "  $i) $opt" >&2; i=$((i + 1)); done
  n=$#
  while true; do
    printf "Type a number (1-%s): " "$n" >&2
    read -r answer
    case "$answer" in
      *[!0-9]*|"") ;;
      *) if [ "$answer" -ge 1 ] && [ "$answer" -le "$n" ]; then echo "$answer"; return; fi ;;
    esac
    echo "Please type one of the numbers shown." >&2
  done
}

# ---------------------------------------------------------------- questions

log "================================================"
log " Creator Kit setup"
log "================================================"
log "Folder: $REPO"

if [ "$(uname -s)" != "Darwin" ]; then
  log "Note: this script is written for macOS. On Linux it works if Homebrew is installed."
fi

if [ -z "$PARTS" ]; then
  case "$(ask_choice "What do you want to make?" "Reels (short videos)" "Websites" "Both")" in
    1) PARTS="reels" ;; 2) PARTS="sites" ;; *) PARTS="both" ;;
  esac
fi
WANT_REELS=0
WANT_SITES=0
case "$PARTS" in
  reels) WANT_REELS=1; PART_LIST="reels" ;;
  sites) WANT_SITES=1; PART_LIST="sites" ;;
  both) WANT_REELS=1; WANT_SITES=1; PART_LIST="reels,sites" ;;
esac

if [ "$WANT_REELS" -eq 1 ] && [ -z "$ENGINE" ]; then
  echo ""
  echo "Remotion:    reels are built from ready-made React templates in this kit. Works today."
  echo "HyperFrames: reels are built as animated HTML pages. Freer, one-off motion pieces."
  case "$(ask_choice "Which video engine?" "Remotion" "HyperFrames")" in
    1) ENGINE="remotion" ;; *) ENGINE="hyperframes" ;;
  esac
fi
[ -n "$ENGINE" ] || ENGINE="remotion"

# ---------------------------------------------------------------- plan

MISSING=""
for t in node python uv ffmpeg git gh; do
  tool_ok "$t" || MISSING="$MISSING $t"
done

log ""
log "Here is what setup will do:"
log ""
if ! has brew && [ -n "$MISSING" ]; then
  log "  Install Homebrew (the Mac's free package installer; it asks for your Mac password)"
fi
if [ -n "$MISSING" ]; then
  log "  Install these programs with Homebrew:"
  for t in $MISSING; do log "    - $(formula "$t")"; done
else
  log "  Programs: Node.js, Python, uv, ffmpeg, Git and GitHub CLI are already installed."
fi
log "  Install the kit's packages (npm ci):"
if [ "$WANT_REELS" -eq 1 ]; then log "    - reel studio (Remotion, about 400 MB)"; else log "    - brand checker"; fi
if [ "$WANT_SITES" -eq 1 ]; then log "    - website template (sites/template)"; fi
ENGINE_NOTE=""
[ "$WANT_REELS" -eq 1 ] && ENGINE_NOTE=" ($ENGINE)"
log "  Download the skills for ${PART_LIST/,/ + }$ENGINE_NOTE from their own GitHub pages,"
log "    at the exact versions in setup/skills.lock.yaml, into .claude/skills/"
PLUGINS="superpowers"
[ "$WANT_SITES" -eq 1 ] && PLUGINS="superpowers, frontend-design"
log "  Add Claude Code plugins ($PLUGINS) if Claude Code is installed"
log "  Create your keys file .env from .env.example (only if you do not have one)"
log "  Run a health check and render one test picture"
log ""
log "Nothing is posted or uploaded. No passwords or keys are asked for."

if [ "$YES" -ne 1 ]; then
  printf "Go ahead? (y/n) "
  read -r answer
  case "$answer" in
    y|Y|yes|YES|Yes) ;;
    *) log "Stopped. Nothing was installed."; exit 0 ;;
  esac
fi

# ---------------------------------------------------------------- programs

load_brew() {
  if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
  if [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
}

if [ -n "$MISSING" ]; then
  load_brew
  if ! has brew; then
    log ""
    log ">> Installing Homebrew (official installer from brew.sh)"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" \
      || stop_setup "Homebrew did not install. Follow the steps on https://brew.sh, then run the setup again."
    load_brew
    has brew || stop_setup "Homebrew was installed, but this window cannot see it yet. Close Terminal, open it again in the creator-kit folder and run the setup again."
  fi
  for t in $MISSING; do
    step "Installing $(formula "$t")" "You can also install it yourself: brew install $(formula "$t")" brew install "$(formula "$t")"
    hash -r
    tool_ok "$t" || stop_setup "$(formula "$t") was installed, but this window cannot see it yet. Close Terminal, open it again in the creator-kit folder and run the setup again."
  done
fi

# ---------------------------------------------------------------- packages

NPM_FIX="Check your internet connection and run the setup again."
if [ "$WANT_REELS" -eq 1 ]; then
  step "Installing the reel studio packages" "$NPM_FIX" npm ci --no-audit --no-fund
else
  # Sites only: the root packages without the reel studio.
  step "Installing the brand checker" "$NPM_FIX" npm ci --workspaces=false --no-audit --no-fund
fi
if [ "$WANT_SITES" -eq 1 ]; then
  step "Installing the website template packages" "$NPM_FIX" npm --prefix sites/template ci --no-audit --no-fund
fi

# ---------------------------------------------------------------- .env

for dir in . sites/template; do
  if [ "$dir" != "." ] && [ "$WANT_SITES" -ne 1 ]; then continue; fi
  if [ -f "$dir/.env.example" ] && [ ! -f "$dir/.env" ]; then
    cp "$dir/.env.example" "$dir/.env"
    log "Created $dir/.env (empty keys; add yours later, every key is optional)."
  fi
done

# ---------------------------------------------------------------- skills

if [ "$WANT_REELS" -eq 1 ] && [ "$WANT_SITES" -eq 1 ]; then CHOICE_PARTS='"reels","sites"'
elif [ "$WANT_REELS" -eq 1 ]; then CHOICE_PARTS='"reels"'
else CHOICE_PARTS='"sites"'; fi
printf '{"parts":[%s],"engine":"%s"}\n' "$CHOICE_PARTS" "$ENGINE" > setup/.choices.json

SKILL_ARGS=(setup/skills.mjs --parts "$PART_LIST" --engine "$ENGINE")
[ "$YES" -eq 1 ] && SKILL_ARGS+=(--yes)
[ -n "$OPTIONAL" ] && SKILL_ARGS+=(--optional "$OPTIONAL")
step "Installing skills" "Check your internet connection and run the setup again." node "${SKILL_ARGS[@]}"

# ---------------------------------------------------------------- checks

log ""
log ">> Health check"
HEALTHY=1
set +e
node setup/doctor.mjs 2>&1 | tee -a "$LOG"
[ "${PIPESTATUS[0]}" -eq 0 ] || HEALTHY=0
set -e

if [ "$WANT_REELS" -eq 1 ]; then
  step "Test picture (renders one frame of the starter reel)" "The first render downloads a small browser; check your internet connection and run the setup again." npm run smoke
  log "   Saved: reels/studio-remotion/out/smoke.png"
  if [ "$ENGINE" = "hyperframes" ]; then
    log "   Note: the HyperFrames starter is coming in a later version. Until then your reels use the Remotion studio with your brand."
  fi
fi
if [ "$WANT_SITES" -eq 1 ]; then
  step "Test build of the website" "Check your internet connection (the first build downloads your fonts) and run the setup again." npm --prefix sites/template run build
  step "Website SEO check" "Open Claude Code and ask it to fix the failed checks listed above." npm --prefix sites/template run check-seo
fi

log ""
log "================================================"
if [ "$HEALTHY" -eq 1 ]; then
  log " Done. Creator Kit is ready."
else
  log " Almost done. The health check found something to fix:"
  log " follow its \"How to fix\" lines above, then run the setup again."
fi
log "================================================"
log "Next:"
log "  1. Open Claude Code in this folder (type \"claude\" here, or use the desktop app)."
log "  2. Type /brand-intake and answer the questions. It makes the kit yours."
[ "$WANT_REELS" -eq 1 ] && log "  3. Then: npm run starter   (your first reel, in your colours)"
[ "$WANT_SITES" -eq 1 ] && log "  3. Then: ask Claude to run /site-builder   (your website)"
log ""
log "Log saved to $LOG"
