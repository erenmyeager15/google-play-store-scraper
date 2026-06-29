# Google Play Store Scraper - Apps, Ratings & Reviews

Scrape public Google Play Store app metadata by package ID, keyword, or category. Export app names, developers, ratings, review counts, install ranges, prices, versions, Android requirements, screenshots, URLs, and optional review rows to JSON, CSV, Excel, HTML, or the Apify API.

This Actor is API-based and does not need a login or API key. Proxy is disabled by default for the quick-start path.

## What It Extracts

- App ID, app name, developer, developer ID, developer website
- Category, category ID, rating, rating text, rating count, review count
- Installs, minimum installs, price, currency, free/paid flag
- In-app purchase and ad-support flags when available
- Content rating, version, Android version, release/update dates
- Summary, description, privacy policy URL, Play Store URL, icon, header image, screenshots
- Optional review rows with review ID, username, score, text, date, thumbs-up count, app version, developer reply, and scrape timestamp

## Quick Start

Use this small input first:

```json
{
  "appIds": ["com.openai.chatgpt"],
  "keywords": [],
  "categories": [],
  "includeReviews": false,
  "maxReviewsPerApp": 0,
  "maxResults": 1,
  "country": "us",
  "language": "en",
  "proxyConfiguration": {
    "useApifyProxy": false
  }
}
```

## Input

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `appIds` | array<string> | `["com.openai.chatgpt"]` | Package names or Play Store URLs. |
| `keywords` | array<string> | `[]` | Search keywords. Matching apps are then scraped in full. |
| `categories` | array<string> | `[]` | Category codes such as `SOCIAL`, `PRODUCTIVITY`, or `GAME_ACTION`. |
| `includeReviews` | boolean | `false` | Saves review rows in addition to app rows. |
| `maxReviewsPerApp` | integer | `10` | Applies only when reviews are enabled. |
| `maxResults` | integer | `1` | Maximum apps across package IDs, keywords, and categories. Use 1-5 for tests. |
| `country` | string | `us` | Two-letter Play Store country code. |
| `language` | string | `en` | Two-letter language code. |
| `proxyConfiguration` | object | disabled | Keep disabled unless large runs start hitting rate limits. |

## Output Dataset

The dataset saves one app row for each matched app. If `includeReviews` is enabled, review rows are saved separately and charged with the `review-scraped` event. The table view focuses on app rows; use JSON export for the full row set.

Verified app sample from an existing successful run:

```json
{
  "appId": "com.openai.chatgpt",
  "appName": "ChatGPT",
  "developer": "OpenAI",
  "category": "Productivity",
  "categoryId": "PRODUCTIVITY",
  "score": 4.7628264,
  "scoreText": "4.8",
  "ratingsCount": 49573361,
  "reviewsCount": 173167,
  "installs": "1,000,000,000+",
  "minInstalls": 1000000000,
  "price": 0,
  "priceText": "Free",
  "currency": "USD",
  "free": true,
  "offersInAppPurchases": true,
  "contentRating": "Teen",
  "version": "1.2026.160",
  "androidVersion": "7.1",
  "updated": "2026-06-19T18:23:00.000Z",
  "released": "Jul 21, 2023",
  "summary": "Your AI assistant for writing, search, image generation, and more",
  "appUrl": "https://play.google.com/store/apps/details?id=com.openai.chatgpt&hl=en&gl=us",
  "country": "us",
  "scrapedAt": "2026-06-21T12:12:05.884Z"
}
```

## Pricing And Cost Control

Current live pricing checked on 2026-06-29:

| Event | Active price |
| --- | ---: |
| `app-scraped` | `$0.002` per app row |
| `review-scraped` | `$0.001` per review row |
| `apify-actor-start` | `$0.00005` per GB |

Review rows are charged only when `includeReviews` is enabled. App and review rows are saved and charged atomically, and workers stop when the user's spending limit is reached.

Cost-control tips:

- Start with one app ID and `maxResults: 1`.
- Keep `includeReviews: false` until you need review rows.
- Keep proxy disabled for normal API-sized runs.
- Use country/language settings deliberately because app metadata can differ by storefront.

## Use Cases

- App Store Optimization (ASO) research
- Competitor metadata and pricing tracking
- App category and install-range analysis
- Review monitoring when review rows are enabled
- Cross-store app intelligence with an Apple App Store scraper

## Known Limits

- Google Play can change public page/API behavior; occasional missing fields should be expected.
- Review collection is heavier and can create many rows; keep `maxReviewsPerApp` low at first.
- Category browsing and broad keyword searches can return many apps, so keep `maxResults` low for tests.

## Responsible Use

Use this Actor only for lawful collection and analysis of public app-store data. Follow Google Play's terms, applicable privacy laws, anti-spam rules, and local regulations. Do not use review data to identify, harass, or spam users.

## License

Apache-2.0
