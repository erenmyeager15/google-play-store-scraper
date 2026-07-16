import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { APP_RECORD_FIELDS } from '../dist/validation.js';

const readText = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));

test('Store sample and input schema enforce direct bounded lookups', async () => {
    const [actor, schema, input] = await Promise.all([
        readJson('../.actor/actor.json'),
        readJson('../INPUT_SCHEMA.json'),
        readJson('../input.json'),
    ]);
    const example = JSON.parse(actor.exampleRunInput.body);
    assert.deepEqual(example.appIds, ['com.openai.chatgpt']);
    assert.deepEqual(input, example);
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(Object.keys(schema.properties), ['appIds', 'maxResults', 'country', 'language', 'proxyConfiguration']);
    assert.equal(schema.properties.appIds.maxItems, 50);
    assert.equal(schema.properties.maxResults.maximum, 50);
    assert.equal(actor.defaultRunOptions.memoryMbytes, 512);
    assert.equal(actor.maxMemoryMbytes, 512);
    assert.ok(actor.defaultRunOptions.timeoutSecs <= 1800);
});

test('runtime calls only direct app details and never broad or user-content methods', async () => {
    const main = await readText('../src/main.ts');
    assert.match(main, /gplay\.app\(/);
    for (const method of ['search', 'list', 'reviews']) {
        assert.doesNotMatch(main, new RegExp(`gplay\\.${method}\\(`));
    }
    assert.doesNotMatch(main, /review-scraped/);
});

test('dataset schema exactly matches the validated app contract', async () => {
    const [actor, output, dataset, pkg, dockerfile] = await Promise.all([
        readJson('../.actor/actor.json'),
        readJson('../.actor/output_schema.json'),
        readJson('../.actor/dataset_schema.json'),
        readJson('../package.json'),
        readText('../.actor/Dockerfile'),
    ]);
    assert.equal(actor.output, './output_schema.json');
    assert.equal(actor.storages.dataset, './dataset_schema.json');
    assert.deepEqual(Object.keys(dataset.fields), APP_RECORD_FIELDS);
    assert.ok(dataset.views.apps);
    assert.ok(output.properties.runStatus);
    assert.match(pkg.scripts.test, /node --test/);
    assert.match(dockerfile, /npm ci/);
});

test('authoritative live pricing remains unchanged while review billing is inactive', async () => {
    const actor = await readJson('../.actor/actor.json');
    const events = actor.pricingInfo.pricingPerEvent.actorChargeEvents;
    assert.equal(events['app-scraped'].eventPriceUsd, 0.002);
    assert.equal(events['review-scraped'].eventPriceUsd, 0.001);
    assert.equal(events['apify-actor-start'].eventPriceUsd, 0.00005);
    assert.match(events['review-scraped'].eventDescription, /does not collect or charge for reviews/);
});
