import type { AppRecord, ReviewRecord } from './types.js';

const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const isoOrNull = (v: unknown): string | null => {
    if (typeof v === 'number' && v > 0) return new Date(v).toISOString();
    if (typeof v === 'string' && v.trim()) return v;
    return null;
};

/** Map a google-play-scraper app object to our clean AppRecord. */
export function mapApp(a: any, country: string): AppRecord {
    return {
        appId: a.appId,
        appName: a.title ?? null,
        developer: a.developer ?? null,
        developerId: a.developerId != null ? String(a.developerId) : null,
        developerWebsite: a.developerWebsite ?? null,
        category: a.genre ?? null,
        categoryId: a.genreId ?? null,
        score: numOrNull(a.score),
        scoreText: a.scoreText ?? null,
        ratingsCount: numOrNull(a.ratings),
        reviewsCount: numOrNull(a.reviews),
        installs: a.installs ?? null,
        minInstalls: numOrNull(a.minInstalls),
        price: numOrNull(a.price),
        priceText: a.priceText ?? null,
        currency: a.currency ?? null,
        free: typeof a.free === 'boolean' ? a.free : null,
        offersInAppPurchases: typeof a.offersIAP === 'boolean' ? a.offersIAP : null,
        inAppPurchaseRange: a.IAPRange ?? null,
        adSupported: typeof a.adSupported === 'boolean' ? a.adSupported : null,
        contentRating: a.contentRating ?? null,
        version: a.version ?? null,
        androidVersion: a.androidVersionText ?? a.androidVersion ?? null,
        updated: isoOrNull(a.updated),
        released: a.released ?? null,
        summary: a.summary ?? null,
        description: a.description ?? null,
        iconUrl: a.icon ?? null,
        headerImageUrl: a.headerImage ?? null,
        screenshots: Array.isArray(a.screenshots) ? a.screenshots : [],
        privacyPolicyUrl: a.privacyPolicy ?? null,
        appUrl: a.url ?? `https://play.google.com/store/apps/details?id=${a.appId}`,
        country,
        scrapedAt: new Date().toISOString(),
    };
}

/** Map a google-play-scraper review object to our clean ReviewRecord. */
export function mapReview(r: any, appId: string): ReviewRecord {
    return {
        appId,
        reviewId: r.id ?? null,
        userName: r.userName ?? null,
        score: numOrNull(r.score),
        text: r.text ?? null,
        date: isoOrNull(r.date),
        thumbsUp: numOrNull(r.thumbsUp),
        reviewVersion: r.version ?? null,
        developerReply: r.replyText ?? null,
        scrapedAt: new Date().toISOString(),
    };
}
