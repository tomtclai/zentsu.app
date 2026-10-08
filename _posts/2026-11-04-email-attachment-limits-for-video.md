---
layout: post
published: false
title: 'Email attachment limits in Gmail, Outlook.com, and iCloud Mail, and what fits a video'
slug: email-attachment-limits-for-video
date: 2026-11-04
description: 'Gmail and Outlook.com allow 25 MB, iCloud Mail 20 MB. What happens above the limit in each, and how much video actually fits, with measured sizes from a Mac.'
image:
  path: /assets/press-og.png
  width: 1200
  height: 630
  alt: 'Press: video and image converter for macOS'
---

Email is still how a lot of video gets to a family member, a client, or a school. It is also where a one-minute phone clip most often bounces. The three big personal mail services set different limits, handle an oversized message in different ways, and none of them is generous by video standards.

This post lists what each provider documents, shows how much video fits under those numbers, and explains how we size a clip for email in [Press](/press/), the Mac converter we build. The sizes come from a 60-second 4K HEVC test clip with AAC audio, converted on a MacBook Air with an M5 chip running macOS 27.0.1.

## The limits, from each provider

Gmail's help page on [sending attachments](https://support.google.com/mail/answer/6584){: rel="noopener"} puts the limit for personal accounts at 25 MB. On a work or school account, the Google Workspace administrator sets it. When the attachments add up to more than the limit, Gmail removes them from the message and puts a Google Drive link in the body instead.

Outlook.com also stops at 25 MB, and Microsoft's page on [attaching files in Outlook.com](https://support.microsoft.com/en-us/office/unable-to-attach-files-in-outlook-com-9e1f02c0-ac68-4e7b-b6fe-7a4075976e42){: rel="noopener"} is specific about what counts: the whole email, including its text and every inserted or attached file. A file shared as a OneDrive link does not count toward that limit, and the linked file can be up to 2 GB.

iCloud Mail is the tightest of the three. Apple's page on [iCloud mailbox and sending limits](https://support.apple.com/102198){: rel="noopener"} lists 20 MB for incoming and outgoing messages, or up to 5 GB with Mail Drop turned on. Mail Drop is Apple's version of the link approach. According to Apple's [Mail Drop limits](https://support.apple.com/108329){: rel="noopener"} page, when a message is larger than your provider allows, Mail offers to send the attachments through Mail Drop, which handles files up to 5 GB. Each one expires after 30 days.

So the numbers to work with are 25 MB for Gmail and Outlook.com, and 20 MB for iCloud Mail. In every case the limit covers the message, so leave a little room for the text.

## How much video that is

A file's size is its bitrate multiplied by its length. Twenty-five megabytes is 200 megabits, which works out to about 3.3 megabits per second for a one-minute clip, video and audio together. At 20 MB, it is about 2.7.

Our test clip, like most footage straight from a camera, is nowhere near that. Here is the same 60 seconds at a few common settings:

| File                  | Size     |
| --------------------- | -------- |
| Original 4K HEVC .mov | 153.5 MB |
| H.264 at 1080p        | 80.8 MB  |
| H.264 at 720p         | 57.2 MB  |

None of these fit. Even the 720p file is more than twice Gmail's limit, and that is the smallest of the standard sizes Press writes without a size target. A lower resolution helps, but for anything longer than about 26 seconds it does not get you there alone. The bitrate has to come from the size limit and the length of the clip.

## Sizing a clip for email

Press's Email preset starts from the number. It aims 10 percent under 25 MB, sets aside 96 kbps for audio, divides the remaining bits by the clip's duration, and gives that bitrate to the H.264 encoder. If the result still comes out over the limit, it encodes once more at a lower rate.

From the same 60-second 4K clip:

| Setting                     | Output  | Time |
| --------------------------- | ------- | ---- |
| Email preset at original 4K | 23.4 MB | 31 s |
| Email preset at 1080p       | 22.7 MB | 8 s  |
| Email preset at 720p        | 22.6 MB | 5 s  |

All three are under the 25 MB that Gmail and Outlook.com document, and by Gmail's own description an attachment under the limit stays an attachment rather than becoming a Drive link. The smaller frame sizes also finished several times faster. For most clips we would pick 1080p: at the same budget, each pixel gets four times the bits it would get at 4K.

None of the three fits iCloud Mail's 20 MB. For iCloud, use the Discord preset, which aims under 20 MB and produced 18.1 MB from the same clip at both 1080p and 720p, or choose a custom limit a little below 20.

## Length still decides the quality

The budget does not change with length, so a longer clip gets fewer bits per second. With the Email preset's target, a 30-second clip gets about 5.9 Mbps of video, a one-minute clip about 2.9 Mbps, and a three-minute clip about 0.9 Mbps. Past a couple of minutes, 720p is the better choice, and trimming the clip to the part that matters does more than any setting. In QuickTime Player, Edit > Trim does that before you convert.

## When a link is the better choice

A link is often the right answer, and we would not talk anyone out of it. A Drive link, a OneDrive link, or Mail Drop delivers the full-quality file, and every one of them goes well past the attachment limit. If the person on the other end needs the original, a link is better than any compressed attachment.

An attachment is better when the recipient should not need to open another service, when the file should stay with the message after a Mail Drop link's 30 days are up, or when a form, a school portal, or a colleague asks for the file itself. That is the case the Email preset is for.

## The format matters as much as the size

A file that fits is no use if it will not play on the other end. Press writes H.264 video with AAC audio in an .mp4 for every email export, the combination that Windows and every current browser play without extra software. We explained the HEVC side of this in [why your Mac video is HEVC](/blog/2026/why-macos-gives-you-hevc/).

The [compress a video for email](/press/convert/compress-video-for-email) page walks through the steps, and the [compress a video for Discord](/press/convert/compress-video-for-discord) page covers the 20 MB preset that suits iCloud Mail. Size presets are part of Press Pro, a one-time ${{ site.price_press_lifetime }} purchase that also adds batch conversion. Converting one file at a time to H.264 at Original, 1080p, or 720p is in the free download.
