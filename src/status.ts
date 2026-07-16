import type { RunCounters, RunOutcome } from './types.js';

export function classifyOutcome(counters: RunCounters, spendingLimitReached: boolean): RunOutcome {
    if (spendingLimitReached) return 'stopped_spending_limit';
    if (counters.saved > 0) {
        return counters.failed > 0 || counters.invalid > 0 || counters.notFound > 0
            ? 'partial'
            : 'succeeded';
    }
    if (counters.attempted > 0 && counters.notFound === counters.attempted) return 'empty';
    return 'failed';
}
