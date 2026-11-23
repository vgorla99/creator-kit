# Postiz Cloud

> Part of [Creator Kit](../README.md). One of three ways to schedule your reels. The others are [Postiz self-hosted](postiz-self-host.md) (cheaper, you run a server) and [each platform's own scheduler](posting-native.md) (free, by hand).

Postiz Cloud is the hosted version of [Postiz](https://postiz.com), run by the Postiz team. It's the same app as the self-hosted one, minus the work: no server, and every platform is already registered, so connecting Instagram, TikTok or YouTube is just "click, log in, approve".

**Plan for about 20 minutes.**

## What it costs

There is **no free plan**. New accounts usually get a **7-day free trial**.

| Plan | Monthly | Yearly | Channels |
|---|---|---|---|
| **Standard** | $29 | $278 | 5 |
| Team | $39 | $374 | 10 |
| Pro | $49 | $470 | 30 |
| Ultimate | $99 | $950 | 100 |

Prices from the [Postiz plans page](https://docs.postiz.com/cloud/plans), checked November 2026. The live price at [postiz.com](https://postiz.com) wins if they differ.

- A **channel** is one connected account. Instagram + TikTok + YouTube = 3 channels, so **Standard** is enough for one creator.
- Posts per month are unlimited on every plan.
- Team members (other people logging in) start at the Team plan.

**Compared with self-hosting** (about €7–8/month): Cloud costs more, but there's nothing to install or maintain, and TikTok works without registering and auditing your own TikTok app. See [the self-host guide](postiz-self-host.md#124-tiktok) for why that matters.

## 1. Before you start

- A payment card. The trial places a small authorisation on it to check the card is real; it's released straight away and is not a charge.
- **Instagram** must be a professional account (Business or Creator). Switch in the Instagram app: Settings → Account type and tools.
- Your TikTok and YouTube logins.

## 2. Sign up and start the trial

1. Go to [postiz.com](https://postiz.com) and sign up.
2. Pick a plan (Standard is fine to start) and choose monthly or yearly.
3. Enter your card to start the 7-day trial.

**You should see** the Postiz **Calendar**. Until you pick a plan, Postiz only shows the plan picker; that's normal.

> [!NOTE]
> The trial is offered once per organisation. If you signed up before, you may not see it again.

## 3. Connect your channels

On the Calendar, find the left sidebar and click **Add Channel**. Do this once for each platform.

### Instagram

1. Click **Instagram**. Postiz offers two kinds:
   - **Instagram (Standalone)**: logs in with Instagram directly. Pick this if your Instagram isn't linked to a Facebook Page.
   - **Instagram (Facebook Business)**: logs in through Facebook. Pick this if your Instagram is linked to a Facebook Page. It also allows adding audio to Reels.
2. Log in on the Instagram or Facebook screen and approve the permissions.
3. If asked, choose which account or Page to connect.

**You should see** your Instagram picture appear in the sidebar.

### TikTok

1. Click **TikTok**, log in to TikTok and approve.
2. If the page goes blank, try again in a private (incognito) window.

**You should see** your TikTok picture in the sidebar.

### YouTube

1. Click **YouTube**, sign in with the Google account that owns your channel and approve.
2. Choose the channel if you have more than one.

**You should see** your channel picture in the sidebar.

A **red marker** on a channel means it needs attention, usually a reconnect from the channel's menu.

## 4. Schedule your first reel

1. Click **Create Post**, or click an empty slot on the calendar to start at that time.
2. At the top, tick the channels to post to.
3. Write your caption in the **Global** tab; it goes to every ticked channel. To change it for one platform, open that platform's tab and unlock it.
4. Drag your video in: the finished reel in `reels/content/00_Ready/<reel>/` (or a fresh render in `reels/studio-remotion/out/` / `reels/studio-hyperframes/out/`).
5. Fill in the settings on the right for each platform. **YouTube needs a title.** For TikTok, choose **Post directly to TikTok** to publish; *Upload without posting* only sends it to your TikTok inbox, where you must finish it by hand within 24 hours.
6. Check the preview column, pick a date and time, and add it to the calendar.

**You should see** the post on the calendar. After its time passes, it shows as published with a link to the live post.

## 5. Managing or cancelling your plan

Everything is in the **Billing** section of Postiz (visible to the account owner).

- **Change plan**: pick a new one. Postiz shows a "Pay Today" figure first. Upgrades charge the difference now; downgrades credit the unused part.
- **Card and invoices**: in the payment portal linked from Billing.
- **Cancel**: Postiz asks for a reason (at least 20 characters). Your plan keeps working until the end of the period you paid for.

> [!WARNING]
> **When your subscription ends, publishing stops.** Scheduled posts stay on the calendar but are **not** published, and they won't go out later if you resubscribe. Your channels, posts and media stay in the account.
>
> If you're cancelling after the trial, schedule those posts with [the platforms' own schedulers](posting-native.md) instead.

## Help

- Postiz Cloud docs: [docs.postiz.com/cloud/overview](https://docs.postiz.com/cloud/overview)
- Connect problems: [docs.postiz.com/general/channels/connect](https://docs.postiz.com/general/channels/connect)
- Cloud support is by email and Discord, both reaching the Postiz team (links in their docs).
