import gplayDefault from 'google-play-scraper';
import { mapApp } from '../dist/routes.js';
import { validateAppRecord } from '../dist/validation.js';

const gplay = gplayDefault.app ? gplayDefault : gplayDefault.default;
const appId = 'com.openai.chatgpt';
const raw = await gplay.app({
    appId,
    country: 'us',
    lang: 'en',
    throttle: 2,
    requestOptions: {
        timeout: { request: 20_000 },
        retry: { limit: 0 },
    },
});
const record = mapApp(raw, 'us', 'en');
const errors = validateAppRecord(record, appId);
if (errors.length > 0) {
    throw new Error(`Direct Google Play contract check failed: ${errors.join('; ')}`);
}

console.log(JSON.stringify({
    appId: record.appId,
    appName: record.appName,
    developer: record.developer,
    score: record.score,
    ratingsCount: record.ratingsCount,
    appUrl: record.appUrl,
}, null, 2));
