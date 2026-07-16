# Google Play App Metadata & Ratings Scraper

Look up factual public Google Play app metadata from known Android package IDs or official app-detail URLs. Each saved row contains aggregate app metrics such as rating counts, installs, price, version, Android requirement, and the official Google Play URL.

This version intentionally supports direct app lookups only. It does not search Google Play, browse categories, collect descriptions or media, or extract individual user reviews.

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

Example shape:

```json
{
  "source": "google_play",
  "recordType": "app",
  "appId": "com.openai.chatgpt",
  "appName": "ChatGPT",
  "developer": "OpenAI",
  "category": "Productivity",
  "categoryId": "PRODUCTIVITY",
  "score": 4.7,
  "ratingsCount": 1000000,
  "reviewsCount": 100000,
  "installs": "100,000,000+",
  "minInstalls": 100000000,
  "price": 0,
  "priceText": "Free",
  "currency": "USD",
  "free": true,
  "offersInAppPurchases": true,
  "adSupported": false,
  "contentRating": "Teen",
  "version": "1.0.0",
  "androidVersion": "7.0 and up",
  "updated": "2026-07-01T00:00:00.000Z",
  "released": "Jul 21, 2023",
  "appUrl": "https://play.google.com/store/apps/details?id=com.openai.chatgpt",
  "country": "us",
  "language": "en",
  "scrapedAt": "2026-07-16T00:00:00.000Z"
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

## Reliability Boundaries

- Requests are limited to direct Google Play app-detail lookups for supplied package IDs.
- Each source request has a 20-second timeout and up to three bounded attempts.
- Concurrency and request rate are deliberately low.
- Google Play page structure and availability can change; the Actor reports parser/source failures through `RUN_STATUS`.
- The underlying open-source parser is a maintenance risk, so automated tests verify its mapped contract and a live direct-source check should be run after dependency or source changes.

## Responsible Use

Use this Actor only when your collection and downstream use comply with Google Play's current terms, machine-readable instructions, applicable laws, and any rights attached to the data. This Actor does not grant redistribution or other rights. Do not use it to identify, profile, contact, or target individual users.

## License

Apache-2.0
