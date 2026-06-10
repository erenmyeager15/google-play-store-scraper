import { Actor, log } from 'apify';
import gplayDefault from 'google-play-scraper';
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { ActorInput } from './types.js';
import { mapApp, mapReview } from './routes.js';

// google-play-scraper ships as CJS/ESM interop; normalize the namespace.
const gplay: any = (gplayDefault as any).app ? gplayDefault : (gplayDefault as any).default;

await Actor.init();

const input = ((await Actor.getInput<ActorInput>()) ?? {}) as ActorInput;
const {
    appIds = [],
    keywords = [],
    categories = [],
    includeReviews = false,
    maxReviewsPerApp = 10,
    maxResults = 50,
    country = 'us',
    language = 'en',
    proxyConfiguration: proxyInput,
} = input;

function normalizeId(raw: string): string {
    const m = raw.trim().match(/[?&]id=([^&]+)/);
    return m ? m[1] : raw.trim();
}

const ids = [...new Set(appIds.map(normalizeId).filter(Boolean))];
const kws = keywords.map((k) => k.trim()).filter(Boolean);
const cats = categories.map((c) => c.trim()).filter(Boolean);
const ctry = (country || 'us').toLowerCase();
const lang = (language || 'en').toLowerCase();

if (ids.length === 0 && kws.length === 0 && cats.length === 0) {
    log.error('No input. Provide appIds (e.g. "com.whatsapp"), keywords, or categories.');
    await Actor.exit();
}

// Optional proxy: route the library's HTTP calls through Apify Proxy.
let requestOptions: any = {};
if (proxyInput?.useApifyProxy || proxyInput?.proxyUrls?.length) {
    const proxyConfiguration = await Actor.createProxyConfiguration(proxyInput);
    const proxyUrl = await proxyConfiguration?.newUrl();
    if (proxyUrl) {
        const agent = new HttpsProxyAgent(proxyUrl);
        requestOptions = { agent: { https: agent, http: agent } };
        log.info('Routing requests through Apify Proxy.');
    }
}

const base = { country: ctry, lang, throttle: 8, requestOptions };

// Resolve keywords + categories into app IDs.
const collectedIds = new Set<string>(ids);

for (const term of kws) {
    try {
        const res = await gplay.search({ term, num: Math.min(maxResults, 100), ...base });
        for (const a of res) if (a.appId) collectedIds.add(a.appId);
        log.info(`Search "${term}" -> ${res.length} apps`);
    } catch (e) {
        log.warning(`Search "${term}" failed: ${(e as Error).message}`);
    }
}

for (const cat of cats) {
    try {
        const res = await gplay.list({ category: cat, num: Math.min(maxResults, 100), ...base });
        for (const a of res) if (a.appId) collectedIds.add(a.appId);
        log.info(`Category "${cat}" -> ${res.length} apps`);
    } catch (e) {
        log.warning(`Category "${cat}" failed: ${(e as Error).message}`);
    }
}

const targetIds = [...collectedIds].slice(0, maxResults > 0 ? maxResults : undefined);
log.info(`Scraping ${targetIds.length} app(s) | reviews=${includeReviews}`);

// Concurrency-limited processing.
const CONCURRENCY = 5;
let scraped = 0;
let cursor = 0;

async function worker(): Promise<void> {
    while (cursor < targetIds.length) {
        const appId = targetIds[cursor++];
        try {
            const app = await gplay.app({ appId, ...base });
            const appRecord: any = mapApp(app, ctry);
            let reviews: any[] = [];

            if (includeReviews && maxReviewsPerApp > 0) {
                try {
                    const rv = await gplay.reviews({ appId, num: maxReviewsPerApp, sort: gplay.sort.NEWEST, ...base });
                    const data = Array.isArray(rv) ? rv : (rv?.data ?? []);
                    reviews = data.slice(0, maxReviewsPerApp).map((r: any) => mapReview(r, appId));
                } catch (e) {
                    log.warning(`${appId}: reviews failed - ${(e as Error).message}`);
                }
            }

            appRecord.reviewsScrapedCount = reviews.length;
            appRecord.reviews = reviews;
            await Actor.pushData(appRecord);
            await Actor.charge({ eventName: 'app-scraped' }).catch(() => null);
            for (let i = 0; i < reviews.length; i++) await Actor.charge({ eventName: 'review-scraped' }).catch(() => null);
            scraped++;
            log.info(`${appId}: app scraped${reviews.length ? ` + ${reviews.length} reviews` : ''}`);
        } catch (e) {
            log.warning(`${appId}: failed - ${(e as Error).message}`);
        }
    }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targetIds.length) }, () => worker()));

log.info(`Google Play scrape finished. ${scraped} apps scraped.`);
await Actor.exit();
