import type { AppRecord } from './types.js';

function objectValue(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

function text(value: unknown, maximum = 1_000): string | null {
    if (typeof value !== 'string') return null;
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized ? normalized.slice(0, maximum) : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function integerValue(value: unknown): number | null {
    const number = numberValue(value);
    return number !== null && Number.isInteger(number) ? number : null;
}

function booleanValue(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}

function isoTimestamp(value: unknown): string | null {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function mapApp(value: unknown, country: string, language: string): AppRecord {
    const app = objectValue(value);
    return {
        source: 'google_play',
        recordType: 'app',
        appId: text(app.appId, 255) ?? '',
        appName: text(app.title, 300) ?? '',
        developer: text(app.developer, 300) ?? '',
        category: text(app.genre, 300),
        categoryId: text(app.genreId, 300),
        score: numberValue(app.score),
        ratingsCount: integerValue(app.ratings),
        reviewsCount: integerValue(app.reviews),
        installs: text(app.installs, 300),
        minInstalls: integerValue(app.minInstalls),
        price: numberValue(app.price),
        priceText: text(app.priceText, 300),
        currency: text(app.currency, 20)?.toUpperCase() ?? null,
        free: booleanValue(app.free),
        offersInAppPurchases: booleanValue(app.offersIAP),
        adSupported: booleanValue(app.adSupported),
        contentRating: text(app.contentRating, 300),
        version: text(app.version, 300),
        androidVersion: text(app.androidVersionText ?? app.androidVersion, 300),
        updated: isoTimestamp(app.updated),
        released: text(app.released, 300),
        appUrl: text(app.url, 2_000) ?? '',
        country,
        language,
        scrapedAt: new Date().toISOString(),
    };
}
