import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeInput, normalizePackageId } from '../dist/input.js';

test('blank input becomes the bounded one-app QA sample', () => {
    assert.deepEqual(normalizeInput(undefined), {
        appIds: ['com.openai.chatgpt'],
        maxResults: 1,
        country: 'us',
        language: 'en',
        proxyConfiguration: { useApifyProxy: false },
    });
});

test('package IDs and official details URLs normalize and deduplicate', () => {
    const input = normalizeInput({
        appIds: [
            'com.openai.chatgpt',
            'https://play.google.com/store/apps/details?id=com.openai.chatgpt&hl=en',
            'com.google.android.youtube',
        ],
        maxResults: 2,
        country: 'IN',
        language: 'EN',
    });
    assert.deepEqual(input.appIds, ['com.openai.chatgpt', 'com.google.android.youtube']);
    assert.equal(input.country, 'in');
    assert.equal(input.language, 'en');
});

test('legacy broad-discovery and review fields are rejected', () => {
    for (const field of ['keywords', 'categories', 'includeReviews', 'maxReviewsPerApp']) {
        assert.throws(() => normalizeInput({ appIds: ['com.openai.chatgpt'], [field]: true }), /Unsupported input field/);
    }
});

test('invalid packages, hosts, locale codes, and oversized runs are rejected', () => {
    assert.throws(() => normalizePackageId('not-a-package'), /Invalid Google Play package ID/);
    assert.throws(() => normalizePackageId('https://example.com/store/apps/details?id=com.example.app'), /must use/);
    assert.throws(() => normalizeInput({ country: 'usa' }), /two-letter code/);
    assert.throws(() => normalizeInput({ maxResults: 51 }), /between 1 and 50/);
});

test('proxy modes cannot be mixed or configured implicitly', () => {
    assert.throws(() => normalizeInput({
        proxyConfiguration: { useApifyProxy: true, proxyUrls: ['https://proxy.example:8000'] },
    }), /either Apify Proxy or custom/);
    assert.throws(() => normalizeInput({
        proxyConfiguration: { useApifyProxy: false, apifyProxyCountry: 'US' },
    }), /Enable useApifyProxy/);
});
