import assert from 'node:assert/strict';
import test from 'node:test';
import { mapApp } from '../dist/routes.js';
import { validateAppRecord } from '../dist/validation.js';

const validRaw = {
    appId: 'com.openai.chatgpt',
    title: 'ChatGPT',
    developer: 'OpenAI',
    score: 4.7,
    ratings: 10,
    reviews: 2,
    minInstalls: 100,
    price: 0,
    free: true,
    url: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt&hl=en&gl=us',
};

test('accepts a valid matching direct app record', () => {
    assert.deepEqual(validateAppRecord(mapApp(validRaw, 'us', 'en'), validRaw.appId), []);
});

test('rejects mismatched identity, invalid bounds, and non-official URLs', () => {
    const record = mapApp(validRaw, 'us', 'en');
    record.score = 8;
    record.appUrl = 'https://example.com/app';
    const errors = validateAppRecord(record, 'com.example.different');
    assert.ok(errors.some((message) => message.includes('appId does not match')));
    assert.ok(errors.some((message) => message.includes('between 0 and 5')));
    assert.ok(errors.some((message) => message.includes('official Google Play')));
});

test('rejects records without required identity text', () => {
    const record = mapApp(validRaw, 'us', 'en');
    record.appName = '';
    record.developer = '';
    const errors = validateAppRecord(record, validRaw.appId);
    assert.ok(errors.some((message) => message.startsWith('appName')));
    assert.ok(errors.some((message) => message.startsWith('developer')));
});
