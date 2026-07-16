import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyOutcome } from '../dist/status.js';

const counters = (changes = {}) => ({
    requested: 1,
    attempted: 1,
    fetched: 0,
    notFound: 0,
    failed: 0,
    invalid: 0,
    saved: 0,
    retries: 0,
    ...changes,
});

test('classifies successful, partial, empty, failed, and spending-limit runs', () => {
    assert.equal(classifyOutcome(counters({ fetched: 1, saved: 1 }), false), 'succeeded');
    assert.equal(classifyOutcome(counters({ fetched: 1, saved: 1, notFound: 1 }), false), 'partial');
    assert.equal(classifyOutcome(counters({ notFound: 1 }), false), 'empty');
    assert.equal(classifyOutcome(counters({ failed: 1 }), false), 'failed');
    assert.equal(classifyOutcome(counters(), true), 'stopped_spending_limit');
});
