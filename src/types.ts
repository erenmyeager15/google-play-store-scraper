export interface ActorInput {
    appIds?: string[];
    keywords?: string[];
    categories?: string[];
    includeReviews?: boolean;
    maxReviewsPerApp?: number;
    maxResults?: number;
    country?: string;
    language?: string;
    proxyConfiguration?: {
        useApifyProxy?: boolean;
        apifyProxyGroups?: string[];
        proxyUrls?: string[];
    };
}

export interface AppRecord {
    appId: string;
    appName: string | null;
    developer: string | null;
    developerId: string | null;
    developerEmail: string | null;
    developerWebsite: string | null;
    category: string | null;
    categoryId: string | null;
    score: number | null;
    scoreText: string | null;
    ratingsCount: number | null;
    reviewsCount: number | null;
    installs: string | null;
    minInstalls: number | null;
    price: number | null;
    priceText: string | null;
    currency: string | null;
    free: boolean | null;
    offersInAppPurchases: boolean | null;
    inAppPurchaseRange: string | null;
    adSupported: boolean | null;
    contentRating: string | null;
    version: string | null;
    androidVersion: string | null;
    updated: string | null;
    released: string | null;
    summary: string | null;
    description: string | null;
    iconUrl: string | null;
    headerImageUrl: string | null;
    screenshots: string[];
    privacyPolicyUrl: string | null;
    appUrl: string;
    country: string;
    scrapedAt: string;
}

export interface ReviewRecord {
    appId: string;
    reviewId: string | null;
    userName: string | null;
    score: number | null;
    text: string | null;
    date: string | null;
    thumbsUp: number | null;
    reviewVersion: string | null;
    developerReply: string | null;
    scrapedAt: string;
}
