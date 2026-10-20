---
layout: post
title: 'Why your Mac video is HEVC in a .mov, and what an H.264 MP4 fixes'
slug: why-macos-gives-you-hevc
date: 2026-10-20
description: 'Where HEVC comes from on an iPhone and Mac, what Finder and QuickTime Player actually export, and what H.264 in an .mp4 buys in compatibility.'
image:
  path: /assets/press-og.png
  width: 1200
  height: 630
  alt: 'Press: video and image converter for macOS'
---

You record a clip on an iPhone, AirDrop it to your Mac, and it plays perfectly. Then you send it to a colleague on a Windows laptop, or drop it into an upload form, and it fails. So you re-export it with the tools macOS gives you, try again, and it fails again.

Two separate things are going on, and the built-in tools fix only one of them. This post explains where the HEVC comes from, what Finder and QuickTime Player actually write, and what H.264 in an .mp4 buys you. We build [Press](/press/), a Mac converter, so we spend a lot of time on this exact failure.

## Codec and container are different problems

Every video file has two layers. The codec is how the pictures are compressed: HEVC (also called H.265) or H.264 for most phone and web video. The container is the wrapper that holds the compressed video, the audio, and the metadata, and it is what the extension names: .mov or .mp4.

A file can be refused for either layer. A player without an HEVC decoder cannot show HEVC video, whatever the extension says. A form that accepts only .mp4 rejects a .mov before it ever looks inside. Renaming a .mov to .mp4 changes only the label, which is why a renamed file sometimes plays on the Mac and still fails on the machine that objected in the first place.

The two containers are close relatives. The Library of Congress format notes say the MP4 format [owes a debt to the QuickTime file format](https://www.loc.gov/preservation/digital/formats/fdd/fdd000155.shtml){: rel="noopener"} that came before it. Close relatives still get treated as strangers by software that checks the extension.

## Where the HEVC comes from

On an iPhone, Settings > Camera > Formats offers two choices. High Efficiency captures photos as HEIF and video as HEVC. Most Compatible captures JPEG and H.264. Apple [recommends the High Efficiency formats](https://support.apple.com/116944){: rel="noopener"} and describes the older ones as more broadly compatible with other devices and operating systems.

The reason to prefer HEVC is file size. HEVC was standardized in 2013 with a design goal of matching H.264's picture quality at about half the bitrate, and [published comparisons](https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding){: rel="noopener"} put the real saving at roughly 25 to 50 percent depending on the content. On a phone that records 4K, that is a lot of storage. Macs on macOS High Sierra or later and iPhones on iOS 11 or later play HEVC with nothing extra installed, so inside Apple's own devices you never see a downside.

The downside shows up when the file leaves.

## What Finder's Encode Selected Video Files writes

Control-click a video in Finder and choose Encode Selected Video Files. Apple's [QuickTime Player guide](https://support.apple.com/guide/quicktime-player/qtp797f6599f/mac){: rel="noopener"} describes it as a way to change the resolution and pick between higher quality and compatibility with more devices.

On current macOS the dialog has one Setting menu. It lists H.264 at 480p, 720p, 1080p, and 2160p, HEVC at 1080p, 2160p, and 4320p, a set of MV-HEVC entries for spatial video, Apple ProRes, and Audio Only. The first entry, H.264 480p, is the one selected when the action ships. We read the action's own script to confirm the rest: it hands each file to Apple's `avconvert` tool with the matching AVFoundation export preset, and every video setting writes a .mov file next to the source.

That makes Finder's action a good fix for the codec half. Pick H.264 1080p and you get H.264 video with AAC audio, the same pairing Apple documents for its [`AVAssetExportPreset1920x1080` preset](https://developer.apple.com/documentation/avfoundation/export-presets){: rel="noopener"}. The container half stays unsolved, because the result still ends in .mov.

## What QuickTime Player's Export As writes

QuickTime Player's File > Export As menu offers 4K, 1080p, 720p, 480p, and Audio Only, with sizes above the source dimmed. Apple's [export page](https://support.apple.com/guide/quicktime-player/qtp20e395859/mac){: rel="noopener"} says the movie is exported as a QuickTime movie (.mov) using H.264 or HEVC.

At 4K and 1080p a Format menu appears with two options. Smaller File Size exports HEVC. Greater Compatibility exports H.264. That second option is the one most people are looking for when a clip gets refused, and it is easy to skip past because it only shows at the two larger sizes. Either way, the file is a .mov.

So both built-in routes can give you H.264. Neither gives you an .mp4.

## What H.264 buys

H.264 dates from 2003 and is the codec almost everything can play. Can I use reports [H.264 support in about 97 percent of browsers](https://caniuse.com/mpeg4){: rel="noopener"} in use, across Chrome, Edge, Firefox, and Safari going back many versions.

HEVC is a different story. Safari has supported it for years. Chrome and Edge play it when the operating system and hardware provide a decoder, and Firefox has added support more recently with similar hardware conditions. The [MDN codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs){: rel="noopener"} lists the details by browser and platform. In practice, a web page or upload preview that plays H.264 everywhere may show a black frame or an error for HEVC on someone else's machine.

Windows is similar. Windows Media Player plays H.264 out of the box, while HEVC playback needs the HEVC Video Extensions from the Microsoft Store, which Microsoft's [codec page](https://support.microsoft.com/en-us/windows/codecs-in-media-player-d5c2cdcd-83a2-4805-abb0-c6888138e456){: rel="noopener"} lists as a separate download. That extension has historically cost $0.99, and some PCs ship with a manufacturer's version already installed. The person receiving your file may not have it.

Part of the reason is licensing. HEVC's patents are licensed through several separate pools rather than one, and Can I use calls HEVC [complex and expensive to license](https://caniuse.com/hevc){: rel="noopener"}. Browser and operating system vendors moved slowly as a result, and the gap has not fully closed more than a decade after the standard was published.

The trade is size. An H.264 file at the same visual quality is larger than the HEVC original, up to about twice the size. For clips that stay on your own Apple devices, HEVC is the better format, and we would leave the camera on High Efficiency. For a file headed to a device or service you do not control, H.264 in an .mp4 is the safer default.

## When the built-in tools are enough

If the person or service on the other end accepts .mov files, you may not need anything else. Finder's H.264 1080p setting, or QuickTime Player's Greater Compatibility option, fixes the codec, and that is usually the half that fails.

The extension matters when a form or a player checks it. Some upload systems check the file type before they look at the video inside. Cornell's video service, for example, tells its users that [.m4v files are not officially supported](https://it.cornell.edu/vod/i-cant-upload-m4v-video-video-demand){: rel="noopener"} and suggests renaming a copy to .mp4. When you hit a check like that, you need both halves at once: H.264 video and an .mp4 container.

## Doing both in one step with Press

Press writes .mp4 files with H.264 video and AAC audio through the same AVFoundation export presets the system uses, and saves each copy next to its source with "(Press)" in the name so the original is never overwritten. When the source is already H.264 with AAC audio and you keep the original resolution, Press copies the streams into the new container without re-encoding, so the picture is untouched.

Converting one file at a time to H.264 at its original size, 1080p, or 720p is free, with no count limit. The step-by-step guides cover the two most common cases:

- [MOV to MP4 on Mac](/press/convert/mov-to-mp4) for a .mov that needs to become an .mp4.
- [HEVC to H.264 on Mac](/press/convert/hevc-to-h264) for a clip that is being refused for its codec.

Press Pro, a one-time ${{ site.price_press_lifetime }} purchase, adds batch conversion of a whole folder, size presets for Discord, email, and Slack upload limits, and 2160p and HEVC output for when you want the smaller file after all.
