import { describe, it, expect, vi } from 'vitest';
import { emitSnapshot } from '../src/collector/orderbookWs';

describe('orderbook collectors', () => {
  it('emitSnapshot stores a feature snapshot via supabase', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
    const supabase = { from: fromMock } as any;

    const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn() } as any;

    const state = {
      lastUpdateId: 123,
      bids: new Map([['100', '1']]),
      asks: new Map([['101', '1']]),
      lastWsEventTs: Date.now() - 50,
      syncOk: true,
      lastMissing: null
    } as any;

    await emitSnapshot(supabase, logger, 'BTCUSDT', state);

    expect(fromMock).toHaveBeenCalledWith('feature_snapshots');
    expect(insertMock).toHaveBeenCalled();
  });
});
