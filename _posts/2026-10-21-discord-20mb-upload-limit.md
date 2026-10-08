---
layout: post
published: false
title: "Discord's 20 MB upload limit, and how to fit a video under it"
slug: discord-20mb-upload-limit
date: 2026-10-21
description: "Discord's free upload limit is 20 MB as of August 2026. What that means in bitrate, why a resolution change alone rarely fits a clip, and what fits on a Mac."
image:
  path: /assets/press-og.png
  width: 1200
  height: 630
  alt: 'Press: video and image converter for macOS'
---

Search for Discord's file size limit and you will still find guides that say 8 MB, or 10 MB. Both numbers were true at some point. As of August 2026, the limit without Nitro is 20 MB, and Discord's own [File Attachments FAQ](https://support.discord.com/hc/en-us/articles/25444343291031-File-Attachments-FAQ){: rel="noopener"} says so, up from 10 MB. Nitro Basic raises it to 50 MB and Nitro to as much as 1 GB. The same page notes that Discord is experimenting with upload limits, so a few accounts may see a larger number than this.

This post covers what 20 MB means for a video, why a smaller resolution alone rarely gets a clip under it, and how we handle it in [Press](/press/), the Mac converter we build. Every size below was measured on a MacBook Air with an M5 chip running macOS 27.0.1, using a 60-second 4K HEVC test clip with AAC audio: a slow pan across a photograph, with grain added so it compresses like camera footage.

## Discord checks the size before compressing

The FAQ has one detail that matters more than the number. Discord now checks a file's size before any compression, on desktop and on mobile. Mobile used to compress first and only then decide whether the file was too large, so the limit you saw and the limit you hit did not always match. Discord says Android users in particular may hit the limit more often under the new check, even though the number went up.

For anyone preparing a clip on a Mac, this is good news. The size Finder shows is the size Discord judges. If Finder says 19.4 MB, the file goes up. If it says 20.6 MB, it does not, and nothing on Discord's side will shrink it for you.

Discord does not say whether its megabyte is 1,000,000 bytes or 1,048,576. Press assumes the smaller one, so its Discord target is 20,000,000 bytes.

## What 20 MB means in bitrate

A file's size is its bitrate multiplied by its length. Twenty megabytes is 160 megabits, so a one-minute clip has to average about 2.7 megabits per second, video and audio together. A 30-second clip gets twice that, and a three-minute clip gets a third of it.

Compare that with what a camera or a Mac writes by default. Our 4K HEVC test clip runs at about 20 Mbps and weighs 153.5 MB for its 60 seconds, almost eight times the limit. Converting it to H.264 at 1080p with Press's standard setting gave an 80.8 MB file, four times the limit. At 720p it was 57.2 MB.

That last number is the one most people run into. A resolution change shrinks a file, but Press's 720p setting still wrote our clip at about 7.4 Mbps, which means 20 MB holds roughly 21 seconds of it. For a clip shorter than that, the free 720p setting is enough. For anything longer, you need a converter that starts from the size and works back to the bitrate.

## Fitting a clip by size

Press's Discord preset does that arithmetic for you. It takes 90 percent of 20 MB as the target, reserves 96 kbps for audio, divides the rest by the clip's duration, and hands the result to the H.264 encoder as the average bitrate. If the first pass still lands over the limit, it lowers the rate and encodes once more.

Here is what that produced from the 60-second 4K clip:

| Setting                       | Output  | Time |
| ----------------------------- | ------- | ---- |
| Discord preset at 1080p       | 18.1 MB | 7 s  |
| Discord preset at 720p        | 18.1 MB | 5 s  |
| Discord preset at original 4K | 22.9 MB | 53 s |

The 1080p and 720p results landed where the preset aims. The 4K result did not, and the reason is worth knowing. For this clip the budget allows about 2.3 Mbps of video, and at 3840 by 2160 pixels the H.264 encoder on our test Mac would not go below about 2.9 Mbps, even on the second pass. A 4K frame has four times the pixels of a 1080p frame, and there is a floor to how few bits an encoder will spend on that many pixels.

The fix is simple: for 4K footage, pick 1080p or 720p alongside the Discord preset. At the same bitrate, each pixel of a 1080p frame gets four times the bits it would get at 4K, and the encoder can actually reach the rate the budget asks for.

## Length is the real constraint

Because the preset keeps the full duration, a longer clip gets fewer bits per second. With the 18 MB target and 96 kbps of audio, a 30-second clip gets about 4.7 Mbps of video, a one-minute clip about 2.3 Mbps, and a three-minute clip about 0.7 Mbps. At 0.7 Mbps, 1080p looks soft, and 720p is the better choice because the same bits cover fewer pixels.

If a clip is long and only part of it matters, trimming it first does more for quality than any encoder setting. In QuickTime Player, Edit > Trim does this, and the trimmed file then gets the whole budget.

## Which format to send

Discord's FAQ lists MOV and MP4 among the common upload types, with H.264, HEVC, or AV1 video inside an MP4. So Discord itself accepts an HEVC file. The question is who is watching. A friend on a Windows PC or in a browser without HEVC support may not be able to play it, which is the problem we covered in [why your Mac video is HEVC](/blog/2026/why-macos-gives-you-hevc/). H.264 in an MP4 is the combination every player handles, so that is what the Discord preset writes.

HEVC would fit more picture into the same 20 MB. If everyone in your server watches on recent Apple devices, Press Pro can write HEVC with the same size limit. For a public server, we would stay with H.264.

## Doing it on a Mac

The steps, with the details, are on the [compress a video for Discord](/press/convert/compress-video-for-discord) page. In short: drop the clip on Press, choose H.264, pick Discord under Size limit, add 1080p or 720p for 4K footage, and convert. The finished row shows the output size, so you can check it against 20 MB before you switch to Discord. The original file is never modified.

If the clip is 4K and short enough that size is not the problem, the [4K to 1080p](/press/convert/4k-to-1080p) conversion is in the free download and may be all you need. Size presets, including Discord, Email, and a custom limit, are part of Press Pro, a one-time ${{ site.price_press_lifetime }} purchase that also adds batch conversion of a whole folder.
