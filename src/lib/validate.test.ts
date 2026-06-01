import { describe, it, expect } from 'vitest';
import { parseAppData } from './validate';
import { emptyAppData } from '../types';

const valid = {
  version: 1,
  territories: [
    { id: 1, name: 'T1', color: '#d4a857', notes: '',
      geometry: { type: 'Polygon', coordinates: [[[ -60.6,-32.9],[ -60.6,-32.8],[ -60.5,-32.8],[ -60.6,-32.9]]] } }
  ],
  schedule: { days: [] }
};

describe('parseAppData', () => {
  it('accepts well-formed data', () => {
    expect(parseAppData(JSON.stringify(valid))).toEqual(valid);
  });
  it('accepts an empty AppData', () => {
    expect(parseAppData(JSON.stringify(emptyAppData()))).toEqual(emptyAppData());
  });
  it('rejects invalid JSON', () => {
    expect(() => parseAppData('{not json')).toThrow();
  });
  it('rejects missing territories array', () => {
    expect(() => parseAppData('{"version":1,"schedule":{"days":[]}}')).toThrow(/territories/);
  });
  it('rejects a territory without geometry', () => {
    const bad = { ...valid, territories: [{ id: 1, name: 'x', color: '#000', notes: '' }] };
    expect(() => parseAppData(JSON.stringify(bad))).toThrow(/geometry/);
  });
});
