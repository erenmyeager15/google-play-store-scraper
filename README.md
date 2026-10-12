# Google Play Scraper - Ratings, Installs & Versions

Build an Android competitor snapshot for US app agencies, ASO consultants and product teams. Compare known apps by aggregate ratings, install ranges, versions, update dates and download prices, then export CSV for a client brief or a dated spreadsheet comparison.

Enter Android package IDs or official Google Play app-detail URLs. Choose `country: "us"` and `language: "en"` for a consistent US/English lookup. The starter uses direct public app-detail pages without a proxy or API key. Validated factual records include stable package identifiers, official listing links, selected locale and collection timestamps.

This version intentionally supports direct app lookups only. It does not search Google Play, browse categories, collect descriptions or media, or extract individual user reviews.

## US Android app agency workflows

| Research question | Fields to compare | Client deliverable |
| --- | --- | --- |
| How do known Android competitors compare? | `score`, `ratingsCount`, `developer`, `category` | A dated competitor table with official listing links |
| Has the public install bracket changed? | `installs`, `minInstalls` | A reported install-range comparison, not estimated US downloads |
| Which apps have a different version or update date? | `version`, `updated`, `androidVersion` | A release snapshot comparison with collection dates |
| Did the listed download price change? | `price`, `currency`, `free`, `offersInAppPurchases` | A same-locale, same-currency comparison with monetization flags |

The selected country is a lookup setting, not a guarantee that every metric is US-specific. Install ranges and other aggregate values can be worldwide, approximate or personalized by the source. They do not establish exact downloads, active users, revenue or US audience demographics. Listed download prices exclude subscription plans and in-app purchase amounts.

## Three-app US Android competitor-research starter

Compare Notion, Evernote and Microsoft OneNote using the same country and language settings. These are illustrative productivity apps, not a ranking or endorsement. Replace the package IDs with your client's app and two known competitors.

[Open US Android App Competitor Research](https://apify.com/fascinating_lentil/google-play-store-scraper/examples/us-android-competitor-research)

```json
{
  "appIds": ["notion.id", "com.evernote", "com.microsoft.office.onenote"],
  "maxResults": 3,
  "country": "us",
  "language": "en",
  "proxyConfiguration": {
    "useApifyProxy": false
  }
}
```

The package IDs were checked against official app listing URLs, and the configuration follows the existing input contract. These checks do not establish cloud availability or current profitability for this starter. Set `maxResults` to the number of unique packages you want to process: the Actor's unchanged default is one app. The starter is capped at three apps and has no schedule.

## CSV snapshot comparison guide

1. Collect the same package IDs with the same `country` and `language`. Check `RUN_STATUS` for saved, failed and not-found counts before reporting results.
2. Export CSV using **all fields**. Keep `appId`, `country`, `language`, `appName`, `score`, `ratingsCount`, `reviewsCount`, `installs`, `minInstalls`, `version`, `updated`, `price`, `currency`, `appUrl` and `scrapedAt`.
3. Save the first file as a dated baseline. On your chosen review date, collect another snapshot with the same packages and locale. Preserve both original exports.
4. Join records on **`appId` + `country` + `language`**. Keep package IDs, version strings and install brackets as text.
5. Compare present scores in rating points, counts as net aggregate changes, versions as strings and prices only when both numeric values exist in the same currency. Report install brackets as brackets; do not infer daily downloads from `minInstalls` differences.

The Actor generates app snapshots and `RUN_STATUS` diagnostics. Persistent history, change calculations, alerts and a combined comparison report belong in your own spreadsheet or downstream workflow; they are not new built-in features of this Actor.

Use the [field-by-field Android comparison guide](https://github.com/erenmyeager15/google-play-store-scraper/blob/main/examples/US-ANDROID-COMPARISON-GUIDE.md) for missing values, approximate installs, localized observations, versions and incomplete runs.

## Quick Start

```json
{
  "appIds": ["com.openai.chatgpt"],
  "maxResults": 1,
  "country": "us",
  "language": "en",
  "proxyConfiguration": {
    "useApifyProxy": false
  }
}
```

You can also provide an official app-detail URL:

```json
{
  "appIds": [
    "https://play.google.com/store/apps/details?id=com.openai.chatgpt"
  ],
  "maxResults": 1
}
```

## Input

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `appIds` | array<string> | `["com.openai.chatgpt"]` | Up to 50 package IDs or official Google Play app-detail URLs. |
| `maxResults` | integer | `1` | Number of unique package IDs to process, from 1 to 50. |
| `country` | string | `us` | Two-letter storefront country code. |
| `language` | string | `en` | Two-letter language code. |
| `proxyConfiguration` | object | disabled | Optional Apify or custom HTTP(S) proxy configuration. |

Unknown input fields are rejected. Duplicate package IDs are processed once.

## Output

Each validated dataset row can include:

- Package ID, app name, developer, category, and category ID
- Aggregate score, rating count, review count, and install range
- Price, currency, free/paid flag, in-app purchase flag, and ad-support flag
- Content rating, version, Android requirement, release date, and update timestamp
- Official Google Play app-detail URL, selected country/language, and scrape timestamp

## Verified Sample Output

This record came from a direct public Google Play lookup for `com.openai.chatgpt` on August 2, 2026. Store values can change after collection.

```json
{
  "source": "google_play",
  "recordType": "app",
  "appId": "com.openai.chatgpt",
  "appName": "ChatGPT",
  "developer": "OpenAI",
  "category": "Productivity",
  "categoryId": "PRODUCTIVITY",
  "score": 4.7693677,
  "ratingsCount": 51143308,
  "reviewsCount": 175855,
  "installs": "1,000,000,000+",
  "minInstalls": 1000000000,
  "price": 0,
  "priceText": "Free",
  "currency": "USD",
  "free": true,
  "offersInAppPurchases": true,
  "adSupported": true,
  "contentRating": "Teen",
  "version": "1.2026.202",
  "androidVersion": "7.1",
  "updated": "2026-08-01T03:50:14.000Z",
  "released": "Jul 21, 2023",
  "appUrl": "https://play.google.com/store/apps/details?id=com.openai.chatgpt",
  "country": "us",
  "language": "en",
  "scrapedAt": "2026-08-01T21:14:56.449Z"
}
```

Nullable fields can be absent from a storefront page and are saved as `null`. Required identity fields are validated before a row is saved or charged.

## Run Diagnostics

Every run writes `RUN_STATUS` to the default key-value store. It records:

- Outcome: `succeeded`, `partial`, `empty`, `stopped_spending_limit`, or `failed`
- Requested, attempted, fetched, unavailable, failed, invalid, saved, and retry counts
- Up to 20 bounded diagnostics without proxy credentials

Unavailable package IDs produce an honest empty or partial outcome. Source/parser failures do not silently pass as successful zero-result runs.

## Pricing And Limits

Current configured prices:

| Event | Price |
| --- | ---: |
| `app-scraped` | `$0.002` per validated app row |
| `apify-actor-start` | `$0.00005` per GB, minimum one event |

The pricing metadata also contains a legacy `review-scraped` event at `$0.001`. It is retained until the next permitted pricing update, but this version never collects reviews or emits that event.

The Actor validates each app row before atomically saving and charging it. Processing stops when the user's event spending limit is reached.

At the current configured price, three successfully saved apps have listed event fees of `$0.006` plus the `$0.00005` minimum start charge at the unchanged 512 MB setting: `$0.00605`. Platform usage is included in customer pricing. Missing or invalid app records are not billed as saved app results; a run can still incur the start charge. This is a price illustration, not a newly measured operating margin or paid-conversion claim.

## Reliability Boundaries

- Requests are limited to direct Google Play app-detail lookups for supplied package IDs.
- Each source request has a 20-second timeout and up to three bounded attempts.
- Concurrency and request rate are deliberately low.
- Google Play page structure and availability can change; the Actor reports parser/source failures through `RUN_STATUS`.
- The underlying open-source parser is a maintenance risk, so automated tests verify its mapped contract and a live direct-source check should be run after dependency or source changes.

## Responsible Use

Use this Actor only when your collection and downstream use comply with Google Play's current terms, machine-readable instructions, applicable laws, and any rights attached to the data. This Actor does not grant redistribution or other rights. Do not use it to identify, profile, contact, or target individual users.

This independent Actor is not affiliated with, endorsed by, or sponsored by Google, Google Play, or the listed app publishers.

## License

Apache-2.0
