# Posting with each platform's own scheduler

> Part of [Creator Kit](../README.md). The zero-cost way to schedule your reels. If you'd rather plan everything on one calendar, see [Postiz self-hosted](postiz-self-host.md) (about €7–8/month) or [Postiz Cloud](postiz-cloud.md) (from $29/month).

Instagram, Facebook, TikTok and YouTube all let you schedule posts for free on their own websites. It takes a few minutes per reel, per platform, and needs no server, no keys and no developer accounts.

**Good for:** starting out, posting a few times a week, or covering a gap (for example after cancelling Postiz Cloud).

## Before you start

- Render your reels with the kit. Each one ends up as an `.mp4`, and `npm run produce` also writes the post text (caption) for each one.
- Use a **computer**. The schedulers below are easiest in a desktop browser.
- **Instagram** must be a professional account (Business or Creator). To use Meta Business Suite, it must also be linked to a Facebook Page. Switch account type in the Instagram app: Settings → Account type and tools.
- **Times use your computer's time zone** on most of these tools. Check it's right before scheduling.

## Instagram and Facebook: Meta Business Suite

One upload can go to both your Instagram and your Facebook Page.

1. Go to [business.facebook.com](https://business.facebook.com) and log in. Pick your business if asked.
2. Click **Create reel** (it may sit under **Create post**, or inside **Content** / **Planner**).
3. Under where to share, tick **Instagram** and/or **Facebook**.
4. Upload your `.mp4` and paste the caption.
5. Optionally pick a cover frame or upload your cover image.
6. Click through to the share step and choose **Schedule** instead of *Share now*. Pick the date and time.
7. Click **Schedule**.

**You should see** the reel in the **Planner** (calendar) on the day you chose. You can open it there to edit, reschedule or delete it before it goes out.

The date picker shows how far ahead you're allowed to schedule.

> [!TIP]
> No Facebook Page? The **Instagram app** can schedule too: create the reel as usual, then on the last screen open **More options** (or **Advanced settings**), switch on **Schedule this post**, and pick the time. Scheduled posts are listed in your profile menu under **Scheduled content**.

## TikTok

TikTok's scheduler lives on the TikTok website.

1. On a computer, go to [tiktok.com](https://www.tiktok.com), log in and click **Upload** (TikTok Studio opens).
2. Choose your `.mp4`, then add the caption and cover.
3. Under the posting options, switch **Schedule** on and pick the date and time.
4. Click **Schedule**.

**You should see** the video listed as scheduled in TikTok Studio, and in your profile on the app.

Good to know, from [TikTok's announcement of the feature](https://ads.tiktok.com/business/en-US/blog/introducing-video-scheduler-now-you-can-plan-tiktoks-in-advance):

- You can schedule from **15 minutes to 10 days** ahead.
- The time uses your **computer's time zone**.
- A scheduled video **can't be edited**. To change it, delete it and upload again.
- TikTok said scheduling needs a **Business account**. If you don't see the Schedule switch, change account type in the app: Settings and privacy → Account.

## YouTube: YouTube Studio

A vertical video of 3 minutes or less becomes a **Short** automatically.

1. Go to [studio.youtube.com](https://studio.youtube.com) and sign in.
2. Click **Create → Upload videos** and choose your `.mp4`.
3. Fill in the title (required) and description. Set **Audience** (made for kids or not).
4. Click **Next** until you reach **Visibility**.
5. Choose **Schedule**, then pick the date and time.
6. Click **Schedule**.

**You should see** the video under **Content** marked as *Scheduled*. It stays private until that moment.

If your channel has a Community Guidelines strike, YouTube won't publish scheduled videos during the penalty; reschedule when it ends.

## A simple weekly routine

1. Render the week's reels with the kit (`npm run produce -- <yyyy-mm> --week <n>`).
2. Review every video and caption yourself. Nothing posts until you schedule it.
3. Open the three schedulers in three browser tabs and schedule each reel, copying the caption from its post text.
4. TikTok only allows 10 days ahead, so schedule TikTok weekly; Instagram, Facebook and YouTube can go further.

When this starts to feel slow, that's the moment to look at [Postiz](postiz-self-host.md).
