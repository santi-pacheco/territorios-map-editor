import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emptyAppData } from '../types';

// Use vi.hoisted so these variables are available inside the hoisted vi.mock factory.
const { single, update, from } = vi.hoisted(() => {
  const single = vi.fn();
  const eq = vi.fn(() => ({ single }));
  const update = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
  const selectEq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq: selectEq }));
  const from = vi.fn(() => ({ select, update }));
  return { single, eq, update, selectEq, select, from };
});

vi.mock('./supabaseClient', () => ({
  supabase: {
    from,
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
    removeChannel: vi.fn()
  }
}));

import { loadAppData, saveAppData } from './supabaseData';

beforeEach(() => {
  single.mockReset();
  from.mockClear();
});

describe('loadAppData', () => {
  it('returns the data column on success', async () => {
    single.mockResolvedValue({ data: { data: emptyAppData() }, error: null });
    const result = await loadAppData();
    expect(result).toEqual(emptyAppData());
    expect(from).toHaveBeenCalledWith('app_data');
  });
  it('throws on supabase error', async () => {
    single.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(loadAppData()).rejects.toThrow('boom');
  });
});

describe('saveAppData', () => {
  it('updates row id=1 and resolves', async () => {
    await expect(saveAppData(emptyAppData())).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith('app_data');
    expect(update).toHaveBeenCalled();
  });
});
