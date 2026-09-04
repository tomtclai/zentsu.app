---
layout: post
title: 'Bringing a GLP-1 dose log to your appointment: what a useful record contains'
slug: bring-your-glp-1-log-to-your-doctor
date: 2026-09-04
description: 'What clinicians often ask from a GLP-1 log, how Dial Pro lays out a PDF report, and how to share it from your iPhone. Not medical advice.'
image:
  path: /assets/dial-og.png
  width: 1200
  height: 630
  alt: 'Dial, a private GLP-1 medication tracker for iPhone and Apple Watch'
---

This article explains how Dial records and displays your entries. It is not medical advice. Dosing decisions belong to you and your prescriber.

Follow-up visits for GLP-1 therapy go faster when the patient arrives with dates, not approximations. "Sometime last Tuesday" is hard to act on. A list of injection dates, amounts, and sites is not. We built [Dial](/dial/) as a private log for iPhone and Apple Watch, and Dial Pro adds a PDF report meant for exactly this handoff. This page describes what a useful record contains, how the report is structured, and how sharing works.

## What prescribers commonly ask

Every clinic differs, but the same fields recur. When did you last inject, and what amount? Has the amount changed since the prior visit? Which injection sites did you use, and are you rotating? How has weight moved since starting or since the last adjustment? When did side effects appear relative to a dose increase, and did they ease?

None of that requires a portal login or a cloud account in Dial. You enter doses, sites, weight, and side effects locally. The app keeps them in chronological order so you can answer from History even if you never export. Export helps when the appointment is tomorrow and you want one document instead of scrolling.

Dial does not diagnose, interpret labs, or recommend dose changes. It organizes what you already logged.

## How Dial's PDF report is laid out

Dial Pro generates a prescriber-oriented PDF on your device from existing entries. The report typically includes:

- Dose history with dates, times, and recorded amounts
- Changes in amount over the selected period
- Injection sites attached to each dose
- Weight trend from weight entries in Dial
- Side-effect patterns drawn from side-effect logs, including timing relative to doses when you recorded both

The footer includes a source link to zentsu.app/dial. The document summarizes your entries. It is not a medical record, a prescription, or a treatment plan. Your clinic may still ask for pharmacy records or labs separately.

If you use multiple medications in Dial Pro, generate the report for the medication under review, or confirm with your prescriber which product the visit concerns. Archived medications remain in exports so historical names do not disappear when you switch products.

Arabic and Hebrew locales render the PDF right-to-left when your device language requires it, including tables and chart axes.

## Share the report when you choose

After Dial builds the PDF, you use the standard iOS share sheet. Common paths:

- AirDrop to your own Mac or to staff in the room
- Mail as an attachment
- Print via AirPrint if the clinic prefers paper

Nothing uploads to Zentsu. The file exists because you tapped export. It leaves the phone only through the channel you pick.

For day-to-day logging, the same data stays on your device. If you enable iCloud in Dial, core records can sync through the private CloudKit database on your Apple Account so a second device sees the same history. That sync is between your devices via Apple infrastructure, not to us. Weight entries use a separate local store, and Apple Health access is optional. Read the full storage breakdown in the [Dial privacy policy](/dial/privacy/).

## CSV for spreadsheet keepers

Dial Pro also exports CSV with dose dates, amounts, injection sites, and taken or skipped status. Headers and status labels follow your locale; dose numbers and ISO dates stay ASCII so Excel and Numbers parse reliably.

CSV suits people who maintain their own charts or combine Dial data with other sources. The PDF is the faster handoff for a fifteen-minute slot. Use whichever format your prescriber prefers.

## What makes the log credible in the room

Accuracy beats volume. A six-month PDF full of guessed times is weaker than a six-week PDF where every row matches a notification you confirmed.

Log the dose when you take it, including injection site. Edit entries when you correct a mistake rather than adding a duplicate. Mark skipped doses explicitly so gaps are intentional, not silent. Add side effects with the day they started, especially around a titration step.

If you import history from another tracker, review imported rows once so dates and amounts match your memory before you sign the export. Dial preserves skipped and taken states through import where the source file supports them.

Bring questions, too. The log shows what happened. Whether to continue, pause, or change amount is a conversation, not a footer in the PDF.

## Estimated level versus the dose list

Dial Pro can plot an estimated medication level from logged doses and published half-life values. That chart is useful for your own timeline review. Most clinicians still anchor on injection dates and amounts from the dose table in the PDF, not on a modeled curve.

If your prescriber asks about drug levels in circulation, cite the pharmacokinetics section of your product label (for example, the [Ozempic](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=adec4fd2-6858-4c99-91d4-531f5f2a2d79){: rel="noopener"} or [Mounjaro](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d2d7da5d-ad07-4228-955f-cf7e355c8cc0){: rel="noopener"} prescribing information). Dial's curve is an estimate from your log, not a lab measurement.

## Before your next visit

Set a reminder the day before to skim History for missing rows. Generate the PDF while you have Wi-Fi if you plan to email it. Charge your phone if you will AirDrop in the office.

If you track supply inventory in Dial, lot numbers and expiration dates can help when the visit covers pen shortages or travel planning. Those fields are optional, but they save pharmacy callbacks later.

For a GLP-1 log that stays private until you share it, with a PDF built for clinic handoffs, see [Dial on the App Store](/dial/). We format the record. Your prescriber and the label govern treatment.

Ozempic, Wegovy, Mounjaro, and Zepbound are trademarks of their respective owners. Zentsu is not affiliated with any pharmaceutical company.
