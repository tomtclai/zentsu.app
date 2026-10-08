---
layout: post
published: false
title: 'When renaming .mov to .mp4 works, and how to check the codec first'
slug: when-renaming-mov-to-mp4-works
date: 2026-10-28
description: 'Apple says renaming a .mov to .mp4 is enough when the video is H.264. How to check the codec in Finder, QuickTime Player, or Terminal, and what to do when it is HEVC.'
image:
  path: /assets/press-og.png
  width: 1200
  height: 630
  alt: 'Press: video and image converter for macOS'
---

The quickest way to turn a .mov into an .mp4 is to rename it, and for a lot of files that is the right answer. Apple's support article [Convert a MOV file to MP4 on Mac](https://support.apple.com/en-us/120755){: rel="noopener"} says that for a MOV that uses H.264, "you can simply change the filename extension of the MOV file to MP4." The resolution and the file size stay the same.

We build [Press](/press/), a Mac converter, so we would sell more copies if renaming never worked. It does work, for one kind of file. This post shows how to tell which kind you have, using tools already on your Mac, and what to do when the answer is HEVC.

## Why a rename can be enough

A video file has two layers. The codec is how the pictures are compressed. The container is the wrapper around the compressed video and audio, and it is what the extension names.

The .mov and .mp4 containers are close relatives. The Library of Congress format notes say MP4 and its predecessor [owe a debt to the QuickTime file format](https://www.loc.gov/preservation/digital/formats/fdd/fdd000155.shtml){: rel="noopener"} that came before them. When the video inside a .mov is H.264 and the audio is AAC, the streams are already what an MP4 player expects, which is why Apple can tell you to change the extension and stop there.

The rename changes only the label. When the codec inside is the problem, the renamed file fails in exactly the same places the original did.

## Check the codec in Finder

Select the file in Finder and press Command-I to open the Get Info window. For a video, Get Info includes a Codecs line that lists the video and audio codecs. On our test files it read "MPEG-4 AAC, H.264" for one and "MPEG-4 AAC, HEVC" for the other. MPEG-4 AAC is the audio. The other entry is the one that decides this.

If it says H.264, rename the file and you are done. If it says HEVC, keep reading.

## Check it in QuickTime Player or Terminal

QuickTime Player shows the same thing with the movie open: choose Window > Show Movie Inspector, or press Command-I. Apple's [QuickTime Player guide](https://support.apple.com/guide/quicktime-player/qtp65619118c/mac){: rel="noopener"} lists the compression format among what the inspector shows, along with the frame size and frame rate.

From Terminal, the Spotlight metadata gives the same answer for a whole folder at once:

```sh
mdls -name kMDItemCodecs clip.mov
```

On an H.264 file that prints:

```
kMDItemCodecs = (
    "MPEG-4 AAC",
    "H.264"
)
```

`mdls` reads Spotlight's index, so it prints `(null)` for files in a folder Spotlight does not index, such as anything under `/tmp`. Finder's Get Info works everywhere.

## Which of your files are H.264

Where a video came from usually tells you its codec before you check.

On an iPhone, Settings > Camera > Formats decides it. Apple's [HEIF and HEVC support article](https://support.apple.com/116944){: rel="noopener"} explains that Most Compatible records H.264 and High Efficiency records HEVC. Apple recommends capturing in HEIF and HEVC, so many iPhone videos are HEVC.

On a Mac, QuickTime Player's File > Export As offers, at 4K and 1080p, a choice labeled Greater Compatibility (H.264) or Smaller File Size (HEVC). Finder's Encode Selected Video Files lists its H.264 and HEVC settings by name. Whichever you picked when you exported is what the file holds.

## What we measured

We ran both kinds of file through Press on a MacBook Air with an M5 chip, macOS 27.0.1. The sources were a 60-second 1080p H.264 .mov with AAC audio, and the same footage as a 60-second 4K HEVC .mov.

The H.264 file is the rename case. Press's Original setting, which copies the streams into a new MP4 container when they are already H.264 and AAC, turned the 80.8 MB .mov into an 80.8 MB .mp4 in 0.1 seconds. The output was 51 bytes smaller than the source, and nothing was re-encoded. It is the same result as a rename, with a proper MP4 container written around the streams, and with the original left in place.

The HEVC file is the case a rename cannot fix. Re-encoding it to H.264 took real work:

| Setting            | Output   | Time |
| ------------------ | -------- | ---- |
| H.264, original 4K | 189.9 MB | 25 s |
| H.264, 1080p       | 80.8 MB  | 7 s  |
| H.264, 720p        | 57.2 MB  | 4 s  |

At its original size the H.264 file was 24 percent larger than the 153.5 MB HEVC source. That is the trade HEVC was designed around: it stores the same picture in fewer bytes, and H.264 needs more of them. Dropping to 1080p brings the file to about half the size of the source.

## When the codec is HEVC

Apple's article suggests iMovie for anything that is not H.264: import the clip, add it to a movie, and export an MP4. That works, and iMovie is free.

Finder and QuickTime Player can also re-encode to H.264 without a project. Both write a .mov, though, so the destination still sees .mov unless you rename the result, which is safe once the codec is H.264.

Press does the re-encode and the container in one step. Drop the file, leave the codec on H.264, pick Original, 1080p, or 720p, and convert. The new file is saved next to the source with "(Press)" in the name. The [MOV to MP4](/press/convert/mov-to-mp4) page walks through it, and the [HEVC to H.264](/press/convert/hevc-to-h264) page covers the codec change on its own.

One file at a time to H.264 at Original, 1080p, or 720p is free in Press, with no count limit. Press Pro, a one-time ${{ site.price_press_lifetime }} purchase, adds batch conversion of a whole folder, size presets for Discord and email, and HEVC and 2160p output.

## A quick way to decide

Press Command-I on the file. If the Codecs line says H.264, rename it. If it says HEVC, convert it. Either way, it takes a few seconds to know which job you have.
