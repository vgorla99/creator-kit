# Postiz, self-hosted

> Part of [Creator Kit](../README.md). One of three ways to schedule your reels. The others are [Postiz Cloud](postiz-cloud.md) (paid, no server) and [each platform's own scheduler](posting-native.md) (free, by hand).

[Postiz](https://postiz.com) is a free, open-source app for scheduling posts. You put it on a small rented server, connect Instagram, TikTok and YouTube once, then plan a whole week of reels on one calendar.

This guide takes you from nothing to a working Postiz at your own address, for example `https://post.example.com`. Every command can be copied and pasted, and each one tells you what you should see afterwards.

**Plan for about 2 hours** the first time. Most of that is waiting and clicking through developer websites, not typing.

> [!IMPORTANT]
> Throughout this guide, `post.example.com` stands for **your** address and `203.0.113.10` stands for **your** server's IP address. Replace both every time you see them.
>
> Never paste your keys, passwords or the contents of `docker-compose.yaml` into a chat, an issue or a screenshot.

## Contents

1. [What it costs](#1-what-it-costs)
2. [What you need before you start](#2-what-you-need-before-you-start)
3. [Rent a server](#3-rent-a-server)
4. [Point your address at the server](#4-point-your-address-at-the-server)
5. [Log in to the server](#5-log-in-to-the-server)
6. [Prepare the server](#6-prepare-the-server)
7. [Install Docker](#7-install-docker)
8. [Download and configure Postiz](#8-download-and-configure-postiz)
9. [Start Postiz](#9-start-postiz)
10. [Add HTTPS with Caddy](#10-add-https-with-caddy)
11. [Create your account and lock the door](#11-create-your-account-and-lock-the-door)
12. [Connect your channels](#12-connect-your-channels)
13. [Back up](#13-back-up)
14. [Update](#14-update)
15. [When something goes wrong](#15-when-something-goes-wrong)

---

## 1. What it costs

Postiz itself is free (AGPL-3.0 licence). You pay for the server and an address.

| Item | Paid route | Free route |
|---|---|---|
| Server | about €6/month before VAT (Hetzner CX23, 4 GB RAM, after Hetzner's June 2026 price change) | €0 on Oracle Cloud's Always Free tier |
| Domain name | about €10/year | about €10/year (or a subdomain of one you already own) |
| Automatic server backups (optional) | Hetzner charges 20% of the server price | not included |
| Postiz | €0 | €0 |
| Developer accounts (Meta, Google, TikTok) | €0 | €0 |
| **Rough total** | **€7–8/month** | **under €1/month** |

Prices change. Check the provider's pricing page on the day you sign up.

**The free route has catches.** Oracle asks for a card to verify you, often shows "out of host capacity" when you try to create the server, and cut its free allowance in half during 2026. It works, but expect to retry, and know that the rules can change again.

**Compared with [Postiz Cloud](postiz-cloud.md)** ($29/month): self-hosting is cheaper and has no channel limit, but you look after the server and you register your own developer app on each platform (section 12). Cloud does both for you.

## 2. What you need before you start

- A computer with a web browser. On Windows, use **PowerShell** or **Windows Terminal** (both are already installed). On a Mac, use **Terminal**.
- A payment card (both server providers ask for one, even on the free tier).
- A **domain name** you control, like `example.com`, bought from any registrar (Cloudflare, Namecheap, Porkbun, your hosting company…). You will use a subdomain of it, like `post.example.com`.
- Your social accounts ready:
  - **Instagram** must be a professional account (Business or Creator). Switch in the Instagram app: Settings → Account type and tools.
  - **YouTube**: a Google account with a channel.
  - **TikTok**: read [section 12.4](#124-tiktok) before you count on it. It is the hardest one.

## 3. Rent a server

You need a server with **Ubuntu 24.04**, **2 CPUs** and **4 GB of memory**. Postiz says it has been tested on 2 GB, but it runs about eight programs together (including a search engine and two databases), so 4 GB leaves room to breathe.

Choose **one** of the two options below.

### Option A: Hetzner (paid, simplest)

1. Create an account at [hetzner.com/cloud](https://www.hetzner.com/cloud) and open the Cloud Console.
2. Create a project, then click **Add Server**.
3. Pick:
   - **Location**: one near you.
   - **Image**: Ubuntu 24.04.
   - **Type**: Shared vCPU, **CX23** (2 vCPU, 4 GB). If it's sold out, the next size up works too.
   - **Networking**: keep **Public IPv4** switched on.
   - **SSH key**: skip it for now; Hetzner will email you a root password. (SSH keys are safer. If you know how to make one, add it here.)
   - **Backups**: tick it if you want Hetzner to keep daily copies (adds 20%).
4. Click **Create & Buy now**.

**You should see** your new server with an IP address like `203.0.113.10`. Write it down. Your login name is `root`.

### Option B: Oracle Cloud Always Free (free, more steps)

1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/). Your **home region** cannot be changed later, and free servers only exist there.
2. In the console, go to **Compute → Instances → Create instance**.
3. Click **Edit** next to *Image and shape*:
   - **Image**: Canonical Ubuntu 24.04.
   - **Shape**: Ampere, **VM.Standard.A1.Flex**, **2 OCPUs** and **12 GB** memory. It must show the *Always Free-eligible* label.
4. Under **Add SSH keys**, choose **Generate a key pair for me** and click **Save private key**. Keep that file safe; it is your only way in.
5. Click **Create**. If you get "out of host capacity", try another availability domain or try again later. This is common.
6. Open the ports for websites: on the instance page, click the **subnet** → the **Default Security List** → **Add Ingress Rules**. Add two rules with *Source CIDR* `0.0.0.0/0`, *IP protocol* TCP, and *Destination port* `80` for the first and `443` for the second.

**You should see** the instance as *Running*, with a public IP address. Your login name is `ubuntu`.

Oracle's Arm processors are fine: the Postiz image is published for Arm.

## 4. Point your address at the server

At your domain registrar, open the DNS settings for your domain and add one record:

| Type | Name | Value |
|---|---|---|
| A | `post` | `203.0.113.10` (your server's IP) |

If you use Cloudflare for DNS, set the record to **DNS only** (grey cloud) for now, so the HTTPS step in section 10 can get its certificate.

Changes usually take a few minutes, sometimes longer. To check, run this on your own computer:

```powershell
nslookup post.example.com
```

**You should see** your server's IP address in the answer. If you see an error or a different address, wait 10 minutes and try again.

## 5. Log in to the server

On your own computer, open PowerShell (Windows) or Terminal (Mac).

**Hetzner:**

```powershell
ssh root@203.0.113.10
```

**Oracle** (point to the key file you saved, for example in Downloads):

```powershell
ssh -i "$HOME\Downloads\ssh-key.key" ubuntu@203.0.113.10
```

The first time, it asks `Are you sure you want to continue connecting?`. Type `yes` and press Enter. On Hetzner, paste the password from the email (nothing appears while you type, that's normal) and set a new one when asked.

**You should see** a line ending in `#` or `$`, like `root@ubuntu-4gb:~#`. From here on, every command in this guide runs **on the server**, in this window.

> [!TIP]
> To paste into the terminal, right-click (Windows) or press Cmd+V (Mac). If you close the window, just run the `ssh` command again to get back in.

## 6. Prepare the server

Install updates and the tools this guide uses:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt install -y git curl openssl nano
```

**You should see** a lot of text scrolling, ending back at the prompt with no red `E:` errors. If a pink screen asks about restarting services, press Enter to accept the default.

Now the firewall. Pick the line for your provider.

**Hetzner (and most other providers):** allow only SSH, web and secure web.

```bash
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw --force enable && sudo ufw status
```

**You should see** `Status: active` and three allowed entries (each listed twice, for IPv4 and IPv6).

**Oracle:** Oracle's Ubuntu uses its own firewall rules. Don't enable `ufw`; open the two web ports like this instead:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT && sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT && sudo netfilter-persistent save
```

**You should see** a couple of `run-parts` lines and no errors.

## 7. Install Docker

Docker runs Postiz and everything it needs in tidy boxes. This is Docker's official install script:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
```

**You should see**, after a minute or two, a block of text ending with notes about "rootless mode". Check that it works:

```bash
sudo docker run --rm hello-world
```

**You should see** `Hello from Docker!` in the output.

## 8. Download and configure Postiz

Download the official Postiz Docker setup into your home folder:

```bash
cd ~ && git clone https://github.com/gitroomhq/postiz-docker-compose && cd postiz-docker-compose && ls
```

**You should see** `LICENSE  README.md  docker-compose.dev.yaml  docker-compose.yaml  dynamicconfig`.

Tell the next commands your address. **Change `post.example.com` to yours** before pressing Enter:

```bash
DOMAIN=post.example.com && echo "Using $DOMAIN"
```

**You should see** `Using post.example.com` with your address. (If you log out and back in, run this line again before continuing.)

Now make three changes to the settings file in one go: your address, a random secret key for logins, and making Postiz reachable only through the secure HTTPS door you'll add in section 10.

```bash
sed -i "s#http://localhost:4007#https://$DOMAIN#g" docker-compose.yaml && sed -i "s#JWT_SECRET: '.*'#JWT_SECRET: '$(openssl rand -hex 32)'#" docker-compose.yaml && sed -i 's#"4007:5000"#"127.0.0.1:4007:5000"#' docker-compose.yaml && grep -n -E "MAIN_URL|FRONTEND_URL|NEXT_PUBLIC_BACKEND_URL|JWT_SECRET|4007" docker-compose.yaml
```

**You should see** five lines like these, with your address and a long random string:

```text
8:      MAIN_URL: 'https://post.example.com'
9:      FRONTEND_URL: 'https://post.example.com'
10:      NEXT_PUBLIC_BACKEND_URL: 'https://post.example.com/api'
11:      JWT_SECRET: '3f9c…(64 characters)…'
118:      - "127.0.0.1:4007:5000"
```

If any line still says `localhost:4007`, your `DOMAIN` was empty: run the `DOMAIN=` line again and repeat this step.

> [!NOTE]
> The file also contains database passwords like `postiz-password`. The databases are not reachable from the internet in this setup, so you can leave them. This file now holds your secret key, so treat it like a password.

## 9. Start Postiz

```bash
sudo docker compose up -d
```

The first start downloads about 2 GB. **You should see** a list of items being pulled, then lines like `Container postiz  Started`.

Postiz needs 2 to 3 minutes to wake up. Then check:

```bash
sudo docker compose ps
```

**You should see** `postiz` with `Up … (healthy)` in the STATUS column. If it says `(health: starting)`, wait a minute and run it again.

Check that it answers on the server itself:

```bash
curl -sI http://127.0.0.1:4007 | head -1
```

**You should see** a line starting with `HTTP/1.1` followed by `200` or a `3xx` number.

## 10. Add HTTPS with Caddy

Postiz needs HTTPS: its login only works over a secure connection, and Instagram, TikTok and YouTube refuse to connect to a plain `http://` address. [Caddy](https://caddyserver.com) is a small web server that fetches and renews free HTTPS certificates by itself.

Install Caddy (official commands from the Caddy docs):

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list && sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg && sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list && sudo apt update && sudo apt install -y caddy
```

**You should see** the install finish without `E:` errors.

Tell Caddy to send your address to Postiz (this uses the `DOMAIN` you set in section 8):

```bash
echo "Using $DOMAIN" && printf '%s {\n\treverse_proxy 127.0.0.1:4007\n}\n' "$DOMAIN" | sudo tee /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

**You should see** `Using post.example.com`, then the three lines of the new file:

```text
post.example.com {
	reverse_proxy 127.0.0.1:4007
}
```

Wait 30 seconds, then open `https://post.example.com` in your browser.

**You should see** the Postiz sign-up page, with a padlock in the address bar. If it doesn't load, see [section 15](#15-when-something-goes-wrong).

## 11. Create your account and lock the door

1. On `https://post.example.com`, click to **sign up** and create your account with your email and a strong password. The first account becomes the owner.
2. **You should see** the Postiz calendar.

Right now anyone who finds your address could also sign up. Close registration:

```bash
cd ~/postiz-docker-compose && sed -i "s#DISABLE_REGISTRATION: 'false'#DISABLE_REGISTRATION: 'true'#" docker-compose.yaml && grep -n DISABLE_REGISTRATION docker-compose.yaml
```

**You should see** `DISABLE_REGISTRATION: 'true'`.

Postiz only reads settings when it starts, so restart it. You'll use this same pair of commands every time you change the settings file:

```bash
sudo docker compose down && sudo docker compose up -d
```

**You should see** containers stopping, then starting. Wait 2 to 3 minutes before reloading the page. You stay logged in, and new sign-ups are refused.

## 12. Connect your channels

On a self-hosted Postiz, each platform needs a **developer app** that you register yourself (free). You do it once per platform. Each app gives you two keys, an ID and a secret, that go into the settings file.

Every platform will ask for a **redirect URI**. For Postiz it is always:

```text
https://post.example.com/integrations/social/<platform>
```

The exact one for each platform is given below. It must match exactly, including `https://` and no slash at the end.

### 12.1 How to add keys to the settings file

Open the file in the `nano` editor:

```bash
cd ~/postiz-docker-compose && nano docker-compose.yaml
```

1. Press **Ctrl+W**, type the key name (for example `YOUTUBE_CLIENT_ID`) and press **Enter**. The cursor jumps to that line.
2. Move the cursor with the arrow keys so it sits **between the two quotes** `''`.
3. Paste your value (right-click on Windows, Cmd+V on Mac). The line should look like `YOUTUBE_CLIENT_ID: 'your-value'`.
4. Repeat for the other key.
5. Save with **Ctrl+O**, then **Enter**. Exit with **Ctrl+X**.

Then restart Postiz:

```bash
sudo docker compose down && sudo docker compose up -d
```

Wait 2 to 3 minutes, open Postiz, and in the left sidebar of the calendar click **Add Channel**.

### 12.2 YouTube

1. Go to the [Google Cloud console credentials page](https://console.cloud.google.com/apis/credentials), accept the terms, and **create a project** (any name, like `my-postiz`).
2. Open **APIs & Services → Library**. Search for and **Enable** each of: **YouTube Data API v3**, **YouTube Analytics API**, **YouTube Reporting API**.
3. Open **OAuth consent screen** (Google may call it *Google Auth Platform*). Choose **External**, fill in the app name and your email, and save.
4. Under **Audience** (or *Test users*), **add your own Google account** as a test user.
5. Open **Credentials → Create credentials → OAuth client ID**:
   - **Application type**: Web application.
   - **Authorized redirect URIs**: `https://post.example.com/integrations/social/youtube`
6. Click **Create**. **You should see** a *Client ID* and *Client secret*.
7. Put them in `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` ([12.1](#121-how-to-add-keys-to-the-settings-file)) and restart.
8. In Postiz: **Add Channel → YouTube**, sign in with Google, approve, and pick your channel.

**You should see** your channel's picture in the Postiz sidebar.

> [!NOTE]
> While your Google app is in *Testing* mode, Google expires the connection after **7 days**, so you'll need to click reconnect on the channel about once a week. Removing that limit means publishing the app, and Google reviews apps that upload videos, which takes effort. Weekly reconnecting is the simple choice for one person.
>
> If your channel belongs to a **Brand Account** managed through Google Workspace, Postiz's [YouTube page](https://docs.postiz.com/self-host/providers/youtube) lists extra admin steps.

### 12.3 Instagram

Your Instagram account must be **professional** (Business or Creator). There are two ways to connect; this guide uses **Instagram Standalone**, which doesn't need a Facebook Page. (If your Instagram is already linked to a Facebook Page and you also want to post to that Page, use Postiz's [Facebook Business option](https://docs.postiz.com/self-host/providers/instagram) instead, which uses `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.)

The settings file doesn't have lines for Instagram Standalone yet. Add two empty ones:

```bash
cd ~/postiz-docker-compose && sed -i "/FACEBOOK_APP_SECRET:/a\      INSTAGRAM_APP_ID: ''\n      INSTAGRAM_APP_SECRET: ''" docker-compose.yaml && grep -n INSTAGRAM_APP docker-compose.yaml
```

**You should see** two lines: `INSTAGRAM_APP_ID: ''` and `INSTAGRAM_APP_SECRET: ''`. Run this only once.

Now create the app:

1. Go to [Meta for Developers](https://developers.facebook.com/apps/) and log in. Click **Create app**.
2. When asked about the use case or app type, choose **Other**, then **Business**. Give it a name and create it.
3. In the app dashboard, add the **Instagram** product and choose **API setup with Instagram login** (Postiz calls this *Instagram Business Login*).
4. In the **Set up Instagram business login** step, add this redirect URL: `https://post.example.com/integrations/social/instagram-standalone`
5. On the same Instagram setup screen, copy the **Instagram app ID** and **Instagram app secret**. (These are different from the main Meta App ID at the top of the page.)
6. Put them in `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET` ([12.1](#121-how-to-add-keys-to-the-settings-file)) and restart.
7. Add yourself as a tester: in the app, open **App roles → Roles → Add People**, choose **Instagram Tester**, and type your Instagram username.
8. Accept the invitation: on [instagram.com/accounts/manage_access](https://www.instagram.com/accounts/manage_access/), open **Tester invites** and accept.
9. In Postiz: **Add Channel → Instagram (Standalone)**, log in to Instagram and approve.

**You should see** your Instagram account in the sidebar.

Your Meta app stays in *development mode*. That's fine: it can post to accounts you added as testers, which covers your own accounts. Only publishing it for strangers needs Meta's business verification and app review.

> [!TIP]
> "Insufficient developer role" means step 7 or 8 was missed for that account.

### 12.4 TikTok

Be honest with yourself before starting this one. To post to TikTok from your own Postiz, TikTok requires:

- a TikTok developer app with **Login Kit** and the **Content Posting API**,
- a **Terms of Service** and a **Privacy Policy** page on a public HTTPS website you own, and verifying that site with TikTok,
- and then TikTok's **audit**. Until your app passes it, every post is forced to **private** (only you can see it), the TikTok account must itself be private, and at most 5 accounts can post per day through your app.

So for most creators, the easier route is to schedule TikTok with [TikTok's own scheduler](posting-native.md#tiktok) and use Postiz for Instagram and YouTube. [Postiz Cloud](postiz-cloud.md) is the other way round this, because Postiz registers the apps there.

If you still want it, here are the steps:

1. At [developers.tiktok.com/apps](https://developers.tiktok.com/apps), create an app. Tick **Web** as the platform and fill in your Terms of Service and Privacy Policy URLs.
2. Add the products **Login Kit** and **Content Posting API**. In Content Posting API, enable **Direct Post**.
3. In Login Kit, set the redirect URI to `https://post.example.com/integrations/social/tiktok`
4. Add the scopes `user.info.basic`, `user.info.profile`, `video.create`, `video.publish`, `video.upload`.
5. Verify your domain `post.example.com` in the TikTok developer portal, because TikTok downloads your videos from your Postiz address.
6. Copy the **Client key** and **Client secret** into `TIKTOK_CLIENT_ID` and `TIKTOK_CLIENT_SECRET` ([12.1](#121-how-to-add-keys-to-the-settings-file)) and restart.
7. In Postiz: **Add Channel → TikTok**. If the page goes blank, retry in a private (incognito) window; Postiz lists this as a known issue.
8. Submit the app for TikTok's audit when you're ready to post publicly.

### 12.5 Schedule your first post

1. In Postiz, click **Create Post** (or click an empty slot on the calendar).
2. Tick the channels at the top, write the caption, and drag in your video from `out/`.
3. Fill in the per-channel settings on the right. YouTube needs a **title**.
4. Pick a date and time and add it to the calendar.

**You should see** the post on the calendar. After its time passes it shows as published, with a link to the live post.

## 13. Back up

Two things hold your data: the **database** (accounts, channels, scheduled posts) and the **uploads** (your media). These commands save both into a `backups` folder on the server:

```bash
mkdir -p ~/backups && cd ~/postiz-docker-compose && sudo docker exec postiz-postgres pg_dump -U postiz-user postiz-db-local | gzip > ~/backups/postiz-db-$(date +%F).sql.gz && sudo docker run --rm -v postiz-docker-compose_postiz-uploads:/data -v ~/backups:/backup alpine tar czf /backup/postiz-uploads-$(date +%F).tar.gz -C /data . && cp docker-compose.yaml ~/backups/docker-compose-$(date +%F).yaml && ls -lh ~/backups
```

**You should see** three files with today's date: `postiz-db-….sql.gz`, `postiz-uploads-….tar.gz` and `docker-compose-….yaml`.

**Run it every night automatically** (at 03:00 server time, keeping 14 days):

```bash
(sudo crontab -l 2>/dev/null; echo "0 3 * * * mkdir -p $HOME/backups && docker exec postiz-postgres pg_dump -U postiz-user postiz-db-local | gzip > $HOME/backups/postiz-db-\$(date +\%F).sql.gz && find $HOME/backups -name 'postiz-db-*' -mtime +14 -delete") | sudo crontab - && sudo crontab -l
```

**You should see** the new line printed back. This nightly job covers the database; run the full command above by hand now and then for the media.

**Copy the backups to your own computer** now and then. Run this **on your computer**, not on the server (Oracle users add `-i "$HOME\Downloads\ssh-key.key"` after `scp` and use `ubuntu@`):

```powershell
scp -r root@203.0.113.10:~/backups .
```

**You should see** each file listed as it downloads into a `backups` folder where your terminal is.

A copy that lives only on the same server dies with the server. Keep one elsewhere, or switch on your provider's backups too.

<details>
<summary>How to restore the database onto a fresh install</summary>

Set up a new server up to the end of section 9, copy your newest `postiz-db-….sql.gz` into `~/backups` there, then:

```bash
cd ~/postiz-docker-compose && sudo docker compose stop postiz && sudo docker exec postiz-postgres psql -U postiz-user -d postiz-db-local -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' && gunzip -c ~/backups/postiz-db-YYYY-MM-DD.sql.gz | sudo docker exec -i postiz-postgres psql -U postiz-user -d postiz-db-local && sudo docker compose start postiz
```

Replace `YYYY-MM-DD` with the date in your file name. This wipes the empty database of the new install and loads your backup into it. Then copy the `JWT_SECRET` and your platform keys from your saved `docker-compose-….yaml` into the new file ([12.1](#121-how-to-add-keys-to-the-settings-file)) and restart with `sudo docker compose down && sudo docker compose up -d`, so your channels keep working.

</details>

## 14. Update

Postiz ships updates often. Once a month is plenty.

1. **Back up first** (the full command in section 13).
2. Read the [Postiz release notes](https://github.com/gitroomhq/postiz-app/releases) for anything marked as a breaking change or migration. Once in a while a release needs extra steps, and the notes link to them.
3. Update Postiz:

   ```bash
   cd ~/postiz-docker-compose && sudo docker compose pull && sudo docker compose up -d
   ```

   **You should see** new images downloading (or "up to date"), then containers recreated. Wait 2 to 3 minutes, then check `sudo docker compose ps` shows `postiz` as `healthy`.

4. Update the server itself:

   ```bash
   sudo apt update && sudo apt upgrade -y && ls /var/run/reboot-required 2>/dev/null
   ```

   If the last line prints `/var/run/reboot-required`, run `sudo reboot`, wait a minute, and log in again. Postiz and Caddy start by themselves.

## 15. When something goes wrong

| Problem | What to do |
|---|---|
| `https://post.example.com` doesn't load | Check DNS (section 4) shows your server IP. Check the firewall (section 6, and on Oracle the security list in section 3). Then read Caddy's log: `sudo journalctl -u caddy --no-pager -n 50`. |
| Padlock error / certificate warning | Caddy couldn't get a certificate, usually because DNS wasn't ready or port 80 is blocked. Fix that, then `sudo systemctl restart caddy`. |
| Page loads but shows an error, or login loops | Check the address lines in section 8 say `https://` and your exact domain. Read Postiz's log: `cd ~/postiz-docker-compose && sudo docker compose logs postiz --tail 100`. |
| `postiz` never becomes `healthy` | Run `free -h`. If *available* memory is near zero, the server is too small: resize to 4 GB or more. |
| "redirect_uri mismatch" or similar when connecting | The redirect URI on the platform must match the one in section 12 character for character. |
| A channel connected but posts fail | Instagram: check you're an Instagram Tester (12.3). TikTok: unaudited apps can only post privately (12.4). |
| YouTube asks to reconnect every week | Expected in Google's Testing mode (12.2). |
| Changed a setting but nothing happened | You need `sudo docker compose down && sudo docker compose up -d` after every change. |

More help: the [Postiz docs](https://docs.postiz.com) and the Postiz community Discord linked from them.
