import type { AppRecord } from './types.js';

export const APP_RECORD_FIELDS = [
    'source', 'recordType', 'appId', 'appName', 'developer', 'category', 'categoryId',
    'score', 'ratingsCount', 'reviewsCount', 'installs', 'minInstalls', 'price',
    'priceText', 'currency', 'free', 'offersInAppPurchases', 'adSupported',
    'contentRating', 'version', 'androidVersion', 'updated', 'released', 'appUrl',
    'country', 'language', 'scrapedAt',
] as const;

const PACKAGE_ID = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;

function optionalText(value: unknown, maximum = 1_000): boolean {
    return value === null || (typeof value === 'string' && value.trim().length > 0 && value.length <= maximum);
}

function optionalNumber(value: unknown, minimum: number, maximum: number, integer = false): boolean {
    return value === null || (typeof value === 'number' && Number.isFinite(value)
        && value >= minimum && value <= maximum && (!integer || Number.isInteger(value)));
}

export function validateAppRecord(record: AppRecord, expectedAppId: string): string[] {
    const errors: string[] = [];
    const keys = Object.keys(record);
    const unexpected = keys.filter((key) => !APP_RECORD_FIELDS.includes(key as typeof APP_RECORD_FIELDS[number]));
    const missing = APP_RECORD_FIELDS.filter((key) => !keys.includes(key));
    if (unexpected.length > 0) errors.push(`unexpected field(s): ${unexpected.join(', ')}`);
    if (missing.length > 0) errors.push(`missing field(s): ${missing.join(', ')}`);
    if (record.source !== 'google_play') errors.push('source must be google_play');
    if (record.recordType !== 'app') errors.push('recordType must be app');
    if (!PACKAGE_ID.test(record.appId) || record.appId !== expectedAppId) errors.push('appId does not match the request');
    if (typeof record.appName !== 'string' || !record.appName.trim() || record.appName.length > 300) {
        errors.push('appName must be non-empty text of at most 300 characters');
    }
    if (typeof record.developer !== 'string' || !record.developer.trim() || record.developer.length > 300) {
        errors.push('developer must be non-empty text of at most 300 characters');
    }
    for (const key of ['category', 'categoryId', 'installs', 'priceText', 'contentRating', 'version', 'androidVersion', 'released'] as const) {
        if (!optionalText(record[key])) errors.push(`${key} must be null or bounded non-empty text`);
    }
    if (!optionalNumber(record.score, 0, 5)) errors.push('score must be null or between 0 and 5');
    for (const key of ['ratingsCount', 'reviewsCount', 'minInstalls'] as const) {
        if (!optionalNumber(record[key], 0, Number.MAX_SAFE_INTEGER, true)) {
            errors.push(`${key} must be null or a non-negative safe integer`);
        }
    }
    if (!optionalNumber(record.price, 0, 1_000_000_000)) errors.push('price must be null or a non-negative number');
    if (record.currency !== null && !/^[A-Z]{3}$/.test(record.currency)) errors.push('currency must be null or an ISO-style code');
    for (const key of ['free', 'offersInAppPurchases', 'adSupported'] as const) {
        if (record[key] !== null && typeof record[key] !== 'boolean') errors.push(`${key} must be null or boolean`);
    }
    if (!/^[a-z]{2}$/.test(record.country)) errors.push('country must be a two-letter lowercase code');
    if (!/^[a-z]{2}$/.test(record.language)) errors.push('language must be a two-letter lowercase code');
    if (record.updated !== null && !Number.isFinite(Date.parse(record.updated))) errors.push('updated must be null or a timestamp');
    if (!Number.isFinite(Date.parse(record.scrapedAt))) errors.push('scrapedAt must be a timestamp');
    try {
        const url = new URL(record.appUrl);
        if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'play.google.com'
            || url.pathname !== '/store/apps/details' || url.searchParams.get('id') !== expectedAppId) {
            errors.push('appUrl must be the matching official Google Play details URL');
        }
    } catch {
        errors.push('appUrl must be a valid URL');
    }
    return errors;
}
