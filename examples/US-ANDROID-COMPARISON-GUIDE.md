# US Android competitor research: CSV snapshot comparison guide

Use factual Google Play app snapshots to prepare a client competitor table. The Actor returns observations for known Android package IDs; spreadsheet comparisons are performed downstream.

[Open the three-app US starter](https://apify.com/fascinating_lentil/google-play-store-scraper/examples/us-android-competitor-research). Its illustrative packages are Notion (`notion.id`), Evernote (`com.evernote`) and Microsoft OneNote (`com.microsoft.office.onenote`). Substitute a client's app and two relevant competitors. Use `country: "us"`, `language: "en"`, `maxResults: 3`, no proxy and no schedule. Official listing IDs and input syntax are checked; this configuration is not a new cloud-tested sample.

## Collect comparable files

1. Keep package IDs, `country` and `language` identical across observations. Set `maxResults` high enough to include all selected unique IDs, up to the existing maximum of 50.
2. Record `RUN_STATUS` and its requested, saved, failed, invalid and not-found counts with each export. A partial or empty result does not prove a competitor has been delisted.
3. Export CSV using all dataset fields. The `apps` display view can omit numeric `price`, `currency` or `minInstalls`; include these explicitly in your comparison export.
4. Save dated baseline and current files. Preserve the original data rather than overwriting it or replacing missing values with zero.
5. Import package IDs, versions, Android requirements and install brackets as text. A version such as `1.10` is a string, not the decimal number `1.1`.
6. Join the files on **`appId` + `country` + `language`**. Keep unmatched rows visible as unobserved in that snapshot.

## Field rules for the client table

| Comparison | Export fields | Rule |
| --- | --- | --- |
| Stable identity | `appId`, `country`, `language`, `appName`, `developer`, `appUrl` | Join on package ID plus locale; show the current title, developer and official listing link. |
| Aggregate rating | `score` | Current minus baseline gives a rating-point difference. Compare only two present numeric values; do not label it a percentage change or a US audience score. |
| Rating/review counts | `ratingsCount`, `reviewsCount` | Keep the two counters distinct. Differences are net observed aggregate changes, not exact new review text, customers or downloads. Source reconciliation and removals can reduce a count. |
| Install bracket | `installs`, `minInstalls` | Retain the displayed range and lower bound. A changed lower bound is an observed bracket change, not exact incremental installs, daily downloads or US-only demand. |
| Version | `version` | Compare complete strings for equality; do not subtract versions, decimal-sort them or infer a rollout to every device. Unknown or device-dependent versions remain unknown. |
| Update/release timing | `updated`, `released`, `scrapedAt` | Keep collection time separate from source update time. `released` is source text, not a normalized timestamp; do not invent a date when it is missing or ambiguous. |
| Download price | `price`, `currency`, `priceText`, `free` | Compare numeric prices only when both values exist and locale/currency match. Zero is a valid free-download price; null is unknown. Avoid percentage changes from a zero baseline. |
| Monetization signals | `offersInAppPurchases`, `adSupported` | Present reported booleans as yes/no/unknown. These flags do not give subscription prices, ad spend, revenue or the exact paid plans offered to a customer. |
| Android requirements | `androidVersion`, `contentRating` | Describe reported listing requirements; do not infer device-level compatibility or app performance. |

US/English inputs select a lookup locale; they do not turn every source metric into US-specific market data. Public install counts can be worldwide approximate ranges. Device targeting, source refresh and localization can affect observations. Confirm unexpected changes against the official listing before using them in a client recommendation.

The listed price is the download price. It is not the cost of a subscription, in-app purchases, taxes or a personalized offer. A free app can still monetize through subscriptions, ads or in-app purchases.

## Suggested client-report columns

Use app name, package ID, selected country/language, baseline/current collection dates, current score, rating-point difference, rating/review count changes, baseline/current install brackets, bracket-changed flag, baseline/current version, version-changed flag, source update date, old/current download price, currency and official listing link. Keep every calculated field beside its original observations.

Only calculate a difference when both required measurements are present. Label missing values, locale/currency mismatches and unmatched rows as **not comparable**. Do not fill in data from another app or storefront to satisfy a result quota.

## Boundaries and workflow

The Actor does not generate persistent history, change reports, alerts or keyword rankings. Save snapshots and calculate comparisons in a spreadsheet or a permitted downstream workflow. Scheduling is optional and must be configured separately by the user; this starter has no schedule.

This guide does not add broad discovery, individual reviews, reviewer identities, descriptions, screenshots or other promotional assets. Use the Actor only when source terms, machine-readable instructions, applicable law and data rights permit the intended collection and downstream use.
