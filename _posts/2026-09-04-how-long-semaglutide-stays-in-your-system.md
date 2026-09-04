---
layout: post
title: 'How long semaglutide and tirzepatide stay in your system, and how Dial draws its estimated level'
slug: how-long-semaglutide-stays-in-your-system
date: 2026-09-04
description: 'Half-life figures from FDA labels, what a decay curve is, and how Dial plots an estimated level from doses you logged. Not medical advice.'
image:
  path: /assets/dial-og.png
  width: 1200
  height: 630
  alt: 'Dial, a private GLP-1 medication tracker for iPhone and Apple Watch'
---

This article explains how Dial records and displays your entries. It is not medical advice. Dosing decisions belong to you and your prescriber.

People on weekly GLP-1 injections often wonder how long the drug keeps circulating after a shot, and what that means between doses. We built [Dial](/dial/) to log doses and plot an estimated level from those entries. This page explains the pharmacokinetics numbers on the prescribing labels, what a decay curve is, and where the chart helps versus where it stops.

## What half-life means on the label

Pharmacokinetics sections of FDA-approved labels describe how a drug enters and leaves the body. One number they publish is elimination half-life: the time it takes for the amount in circulation to fall by half, assuming no new dose arrives.

For subcutaneous semaglutide, the [Ozempic prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=adec4fd2-6858-4c99-91d4-531f5f2a2d79){: rel="noopener"} states an elimination half-life of approximately one week, and that semaglutide will be present in the circulation for about five weeks after the last dose. The [Wegovy label](https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f5e548d0-cc79-4c34-a3f5-e20a5b8b6564){: rel="noopener"} gives the same approximate one-week half-life for subcutaneous semaglutide, with presence in circulation for about five to seven weeks after the last dose of 2.4 mg.

For tirzepatide, the [Mounjaro label](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d2d7da5d-ad07-4228-955f-cf7e355c8cc0){: rel="noopener"} reports an elimination half-life of approximately five days. The [Zepbound label](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=487cd7e7-434c-4925-99fa-aa80b1cc776b){: rel="noopener"} states approximately five to six days in patients with overweight or obesity. These are label facts, not instructions for when to inject. If you need clinical guidance, ask your prescriber and read the label section on missed or delayed doses.

Dial stores published half-life defaults for common medications and lets you override the value per medication in Advanced level estimates. The override tunes the curve on your device. It does not change your dose history.

## A decay curve in plain terms

Imagine one dose as a single contribution that shrinks by half every half-life interval. After one half-life, half remains. After two, one quarter. After three, one eighth. Stack weekly doses and earlier contributions are still fading while new ones arrive, so the total rises and falls between shots instead of dropping to zero on day seven.

That stacked pattern is what people mean when they talk about medication "still being in your system" on day four or day ten. The label half-life describes the rate of decline for each contribution. Your actual blood concentration depends on dose amount, timing, absorption, and individual physiology. Dial does not measure any of that directly.

## What Dial's estimated level chart is

Dial Pro reads the doses you logged (medication, amount, date, and time) and models an estimated level over time. Each recorded dose enters the total at the amount you entered, then decays by half every elimination half-life for that medication. Dial sums those curves across your history and draws the result on the Today screen and in the level chart.

The model is deliberate and limited. It is not a pharmacokinetic simulation of your body. It is a visual summary of your own log, using the same half-life convention common GLP-1 calculators use, so imported histories and the chart read consistently.

Dial explains the method in the app. The landing page states the boundary plainly: the chart shows your own patterns between doses. It is an estimate, not a measured blood level, and not a suggestion of what to take next. Dial does not calculate doses.

## What the chart is useful for

Many people use the curve to see rhythm, not to read an absolute number. Did the modeled level dip sharply before your last injection? Does a late log change the shape you expected? When you change medications or amounts, does the timeline match what you remember? Those comparisons stay inside your record.

The chart also pairs with the dose log on Today: the cycle ring counts down to your next reminder, and the level card sits beside the entries that built it. Change the range to a week, a month, or six months when you want a longer view of your own history.

If you share data with a clinic, the PDF report (Dial Pro) lists dose dates, amounts, and injection sites separately from the modeled curve. The report summarizes entries. It is not a treatment plan.

## What the chart is not for

Do not treat the y-axis as a lab result. Dial has no access to blood work, liver function, kidney function, or other factors labels discuss under specific populations. A flat day on the chart does not prove a therapeutic window. A spike does not prove toxicity.

Do not use the estimate to decide whether to inject early, late, or at a different amount. Those decisions belong to you and your prescriber, using the prescribing information for your product. Dial will not suggest a dose or validate one against a target.

If your prescriber adjusts your half-life assumption or wants a different modeling approach, use the override in Advanced level estimates, or rely on the raw dose list and export. The log remains the source of truth either way.

## Keeping the record accurate

The curve is only as good as the timestamps and amounts you enter. Log the dose when you take it, edit the entry if you correct the time later, and mark skipped doses when you intentionally did not inject (Dial keeps skipped entries out of the estimated level). Reminders, widgets, and Apple Watch glances help you confirm the last taken dose before you interpret the chart.

Your entries stay on your device by default. If you turn on iCloud in Dial, core records can sync through the private CloudKit database on your Apple Account. Details are in the [Dial privacy policy](/dial/privacy/).

For a private GLP-1 log with an estimated level drawn from your own doses, see [Dial on the App Store](/dial/). We plot the curve so you can see your pattern between shots. We leave dosing to you and your prescriber.

Ozempic, Wegovy, Mounjaro, and Zepbound are trademarks of their respective owners. Zentsu is not affiliated with any pharmaceutical company.
