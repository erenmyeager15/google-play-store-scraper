import assert from 'node:assert/strict';
import test from 'node:test';
import { mapApp } from '../dist/routes.js';
import { APP_RECORD_FIELDS } from '../dist/validation.js';

const rawApp = {
    appId: 'com.openai.chatgpt',
    title: ' ChatGPT ',
    developer: 'OpenAI',
    genre: 'Productivity',
    genreId: 'PRODUCTIVITY',
    score: 4.7,
    ratings: 123456,
    reviews: 1234,
    installs: '100,000,000+',
    minInstalls: 100000000,
    price: 0,
    priceText: 'Free',
    currency: 'usd',
    free: true,
    offersIAP: true,
    adSupported: false,
    contentRating: 'Teen',
    version: '1.2.3',
    androidVersionText: '7.0 and up',
    updated: Date.UTC(2026, 6, 1),
    released: 'Jul 21, 2023',
    url: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt&hl=en&gl=us',
    description: 'Not exported',
    screenshots: ['https://example.com/image.png'],
    userName: 'Not exported',
};

test('maps only the bounded factual app contract', () => {
    const record = mapApp(rawApp, 'us', 'en');
    assert.deepEqual(Object.keys(record), APP_RECORD_FIELDS);
    assert.equal(record.appName, 'ChatGPT');
    assert.equal(record.currency, 'USD');
    assert.equal(record.updated, '2026-07-01T00:00:00.000Z');
    for (const forbidden of ['description', 'summary', 'screenshots', 'iconUrl', 'userName', 'reviewText']) {
        assert.equal(forbidden in record, false);
    }
});

test('unknown or malformed optional values map to null', () => {
    const record = mapApp({ appId: 'com.example.app', title: 'Example', developer: 'Developer', url: 'bad' }, 'gb', 'en');
    assert.equal(record.score, null);
    assert.equal(record.updated, null);
    assert.equal(record.free, null);
});
