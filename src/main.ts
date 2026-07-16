import { Actor, log } from 'apify';
import gplayDefault from 'google-play-scraper';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { normalizeInput } from './input.js';
import { mapApp } from './routes.js';
import { classifyOutcome } from './status.js';
import type { RunCounters, RunDiagnostic } from './types.js';
import { validateAppRecord } from './validation.js';

const gplay: any = (gplayDefault as any).app ? gplayDefault : (gplayDefault as any).default;
const APP_SCRAPED_EVENT = 'app-scraped';
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 2;

function safeErrorMessage(error: unknown): string {
    return (error instanceof Error ? error.message : String(error))
        .replace(/https?:\/\/[^@\s]+@/gi, 'https://[redacted]@')
        .slice(0, 500);
}

function errorStatus(error: unknown): number | null {
    if (!error || typeof error !== 'object') return null;
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' && Number.isInteger(status) ? status : null;
}

function isNotFound(error: unknown): boolean {
    return errorStatus(error) === 404 || /app not found\s*\(404\)/i.test(safeErrorMessage(error));
}

function addDiagnostic(diagnostics: RunDiagnostic[], diagnostic: RunDiagnostic): void {
    if (diagnostics.length < 20) diagnostics.push(diagnostic);
}

await Actor.init();

const startedAt = Date.now();
const counters: RunCounters = {
    requested: 0,
    attempted: 0,
    fetched: 0,
    notFound: 0,
    failed: 0,
    invalid: 0,
    saved: 0,
    retries: 0,
};
const diagnostics: RunDiagnostic[] = [];
let spendingLimitReached = false;
let proxyAgent: HttpsProxyAgent<string> | undefined;

try {
    const input = normalizeInput(await Actor.getInput<unknown>());
    const targetIds = input.appIds.slice(0, input.maxResults);
    counters.requested = targetIds.length;

    const proxyConfiguration = await Actor.createProxyConfiguration(input.proxyConfiguration);
    const proxyUrl = await proxyConfiguration?.newUrl('google_play_direct_details');
    if (proxyUrl) {
        proxyAgent = new HttpsProxyAgent(proxyUrl);
        log.info('Routing direct Google Play details requests through the configured proxy.');
    }

    const requestOptions = {
        timeout: { request: 20_000 },
        retry: { limit: 0 },
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
            'accept-language': `${input.language}-${input.country.toUpperCase()},${input.language};q=0.9`,
        },
        ...(proxyAgent ? { agent: { https: proxyAgent } } : {}),
    };
    const base = {
        country: input.country,
        lang: input.language,
        throttle: 2,
        requestOptions,
    };

    async function fetchApp(appId: string): Promise<unknown> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
            try {
                return await gplay.app({ appId, ...base });
            } catch (error) {
                if (isNotFound(error)) throw error;
                lastError = error;
                if (attempt < MAX_ATTEMPTS) {
                    counters.retries += 1;
                    await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
                }
            }
        }
        throw lastError instanceof Error ? lastError : new Error(safeErrorMessage(lastError));
    }

    let cursor = 0;
    async function worker(): Promise<void> {
        while (!spendingLimitReached) {
            const index = cursor;
            cursor += 1;
            if (index >= targetIds.length) return;
            const appId = targetIds[index];
            counters.attempted += 1;

            try {
                const raw = await fetchApp(appId);
                counters.fetched += 1;
                if (spendingLimitReached) return;

                const record = mapApp(raw, input.country, input.language);
                const errors = validateAppRecord(record, appId);
                if (errors.length > 0) {
                    counters.invalid += 1;
                    addDiagnostic(diagnostics, {
                        appId,
                        kind: 'invalid_record',
                        message: errors.join('; ').slice(0, 500),
                    });
                    log.warning(`Skipped invalid Google Play record for ${appId} before billing.`, { errors });
                    continue;
                }

                const chargeResult = await Actor.pushData(record, APP_SCRAPED_EVENT);
                const saved = chargeResult.chargedCount > 0 || !chargeResult.eventChargeLimitReached;
                if (saved) counters.saved += 1;
                if (!saved || chargeResult.eventChargeLimitReached) {
                    spendingLimitReached = true;
                    await Actor.setStatusMessage(`Stopped at the user's spending limit after ${counters.saved} apps`);
                    return;
                }
            } catch (error) {
                const message = safeErrorMessage(error);
                if (isNotFound(error)) {
                    counters.notFound += 1;
                    addDiagnostic(diagnostics, { appId, kind: 'not_found', message });
                    log.info(`${appId}: not available in the selected storefront.`);
                } else {
                    counters.failed += 1;
                    addDiagnostic(diagnostics, { appId, kind: 'source_error', message });
                    log.warning(`${appId}: direct Google Play details request failed.`, { error: message });
                }
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targetIds.length) }, () => worker()));
    const outcome = classifyOutcome(counters, spendingLimitReached);
    await Actor.setValue('RUN_STATUS', {
        generatedAt: new Date().toISOString(),
        outcome,
        scope: 'direct_package_ids_only',
        country: input.country,
        language: input.language,
        spendingLimitReached,
        durationMs: Date.now() - startedAt,
        counters,
        diagnostics,
    });

    if (outcome === 'failed') {
        throw new Error('No valid Google Play app records were collected from the direct details pages.');
    }
    if (!spendingLimitReached) {
        await Actor.setStatusMessage(
            outcome === 'empty'
                ? 'Finished: none of the requested package IDs were available in this storefront'
                : outcome === 'partial'
                    ? `Finished with ${counters.saved} apps and ${counters.failed + counters.invalid + counters.notFound} issue(s)`
                    : `Finished with ${counters.saved} validated Google Play apps`,
        );
    }
    log.info('Google Play direct app lookup finished.', { outcome, counters });
} catch (error) {
    const existing = await Actor.getValue<Record<string, unknown>>('RUN_STATUS');
    if (!existing) {
        await Actor.setValue('RUN_STATUS', {
            generatedAt: new Date().toISOString(),
            outcome: 'failed',
            scope: 'direct_package_ids_only',
            spendingLimitReached,
            durationMs: Date.now() - startedAt,
            counters,
            diagnostics,
            fatalError: safeErrorMessage(error),
        });
    }
    throw error;
} finally {
    proxyAgent?.destroy();
}

await Actor.exit();
