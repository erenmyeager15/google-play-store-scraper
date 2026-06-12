# Google Play Store Scraper - Apps, Ratings & Reviews

Scrape **app data and reviews from the Google Play Store** - no login, no API key required. Get ratings, install counts, prices, developer info, categories, versions, descriptions, screenshots, and user reviews. Search by keyword, app ID, or category, across any country storefront. Export to **JSON, CSV, Excel, or HTML**, or pull via the Apify API.

Perfect for **app store optimization (ASO), competitor tracking, market research, and review monitoring**.

## Features

- ✅ **No login or API key**
- ✅ **Three input modes** - app package IDs, search keywords, or category browsing
- ✅ **Full app metadata** - rating, ratings count, installs, price, developer, version, content rating
- ✅ **User reviews** - optional, nested per app (rating, text, date, helpful count)
- ✅ **Any country & language storefront**
- ✅ **Fast & lightweight** - API-based, no headless browser

## Input

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `appIds` | `string[]` | Package names (e.g. `"com.whatsapp"`) or Play URLs | `["com.whatsapp"]` |
| `keywords` | `string[]` | Search keywords | `[]` |
| `categories` | `string[]` | Category codes (e.g. `"SOCIAL"`, `"GAME_ACTION"`) | `[]` |
| `includeReviews` | `boolean` | Include top reviews per app (nested) | `false` |
| `maxReviewsPerApp` | `integer` | Max reviews per app | `10` |
| `maxResults` | `integer` | Max apps total | `50` |
| `country` | `string` | Storefront country code | `us` |
| `language` | `string` | Language code | `en` |
| `proxyConfiguration` | `object` | Proxy (helps avoid rate limits on large runs) | Apify Proxy |

### Example input

```json
{
  "appIds": ["com.whatsapp"],
  "keywords": ["weather"],
  "includeReviews": true,
  "maxReviewsPerApp": 20,
  "maxResults": 50,
  "country": "us"
}
```

## Sample output

```json
{
  "appId": "com.whatsapp",
  "appName": "WhatsApp Messenger",
  "developer": "WhatsApp LLC",
  "category": "Communication",
  "score": 4.66,
  "ratingsCount": 236591465,
  "reviewsCount": 1965687,
  "installs": "10,000,000,000+",
  "price": 0,
  "free": true,
  "contentRating": "Everyone",
  "version": "VARY",
  "updated": "2026-06-09T...",
  "appUrl": "https://play.google.com/store/apps/details?id=com.whatsapp",
  "reviewsScrapedCount": 3,
  "reviews": [
    { "reviewId": "7e3f...", "userName": "Wisdom John", "score": 5, "text": "...", "date": "2026-06-09T21:35:40.541Z", "thumbsUp": 0, "developerReply": null }
  ],
  "country": "us",
  "scrapedAt": "2026-06-11T10:00:00.000Z"
}
```

## How to Scrape the Google Play Store (Step by Step)

1. Click **Try for free** / **Run**.
2. Add app package IDs (e.g. `com.whatsapp`), search keywords, or category codes (e.g. `SOCIAL`).
3. Set `country`/`language`, and turn on `includeReviews` with `maxReviewsPerApp` if you want reviews.
4. Set `maxResults` (start small to test).
5. Run, then export results as JSON, CSV, Excel, or HTML, or pull them via the Apify API.

## Pricing

This Actor uses **pay-per-result** pricing:

| Event | Price |
|-------|-------|
| Per app scraped | **$0.002** ($2 / 1,000 apps) |
| Per review scraped | **$0.001** ($1 / 1,000 reviews) |

Reviews are charged only when `includeReviews` is on. You are only charged for data actually returned. Apify platform usage is billed separately by Apify.

## Use cases

- **App Store Optimization (ASO)** - track keyword rankings and competitor metadata
- **Review monitoring** - watch sentiment and respond to user feedback
- **Market research** - analyze categories, pricing, and install trends
- **App intelligence** - build cross-store datasets (pairs with an App Store scraper)

## Tips

- App IDs are the package name in a Play URL (`...details?id=com.whatsapp`).
- Use `country`/`language` to localize results and reviews.
- Turn on `includeReviews` and set `maxReviewsPerApp` for review datasets.

## Responsible Use

This Actor is intended for lawful collection of publicly available information only. Users are responsible for ensuring their use complies with the source website's terms, robots.txt, applicable privacy laws, including India's DPDP Act, and all local regulations.

Do not use this Actor to collect, store, sell, or misuse personal data without a lawful basis. The Actor author is not responsible for misuse by end users.

## License

Apache-2.0
