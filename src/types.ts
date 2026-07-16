export interface ProxyInput {
    useApifyProxy: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
    proxyUrls?: string[];
}

export interface NormalizedInput {
    appIds: string[];
    maxResults: number;
    country: string;
    language: string;
    proxyConfiguration: ProxyInput;
}

export interface AppRecord {
    source: 'google_play';
    recordType: 'app';
    appId: string;
    appName: string;
    developer: string;
    category: string | null;
    categoryId: string | null;
    score: number | null;
    ratingsCount: number | null;
    reviewsCount: number | null;
    installs: string | null;
    minInstalls: number | null;
    price: number | null;
    priceText: string | null;
    currency: string | null;
    free: boolean | null;
    offersInAppPurchases: boolean | null;
    adSupported: boolean | null;
    contentRating: string | null;
    version: string | null;
    androidVersion: string | null;
    updated: string | null;
    released: string | null;
    appUrl: string;
    country: string;
    language: string;
    scrapedAt: string;
}

export type RunOutcome = 'succeeded' | 'partial' | 'empty' | 'stopped_spending_limit' | 'failed';

export interface RunCounters {
    requested: number;
    attempted: number;
    fetched: number;
    notFound: number;
    failed: number;
    invalid: number;
    saved: number;
    retries: number;
}

export interface RunDiagnostic {
    appId: string;
    kind: 'not_found' | 'source_error' | 'invalid_record';
    message: string;
}
