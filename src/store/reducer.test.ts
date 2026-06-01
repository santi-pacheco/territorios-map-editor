import { describe, it, expect } from 'vitest';
import { appReducer, type Action } from './reducer';
import { emptyAppData, type AppData, type Territory } from '../types';

const poly = { type: 'Polygon' as const, coordinates: [[[ -60.6,-32.9],[ -60.6,-32.8],[ -60.5,-32.8],[ -60.6,-32.9]]] };
const terr = (id: number): Territory => ({ id, name: `T${id}`, color: '#d4a857', notes: '', geometry: poly });

function run(state: AppData, ...actions: Action[]): AppData {
  return actions.reduce(appReducer, state);
}

describe('appReducer', () => {
  it('adds a territory', () => {
    const s = run(emptyAppData(), { type: 'territory/add', territory: terr(1) });
    expect(s.territories).toHaveLength(1);
    expect(s.territories[0].id).toBe(1);
  });
  it('updates a territory by id', () => {
    const s = run(emptyAppData(),
      { type: 'territory/add', territory: terr(1) },
      { type: 'territory/update', id: 1, patch: { name: 'Nuevo' } });
    expect(s.territories[0].name).toBe('Nuevo');
  });
  it('updates territory geometry', () => {
    const g2 = { ...poly, coordinates: [[[ -60.7,-32.9],[ -60.7,-32.8],[ -60.6,-32.8],[ -60.7,-32.9]]] };
    const s = run(emptyAppData(),
      { type: 'territory/add', territory: terr(1) },
      { type: 'territory/update', id: 1, patch: { geometry: g2 } });
    expect(s.territories[0].geometry).toEqual(g2);
  });
  it('removes a territory and its schedule references', () => {
    let s = run(emptyAppData(), { type: 'territory/add', territory: terr(1) });
    s = appReducer(s, { type: 'day/add', day: { key: 'lun', label: 'Lunes', assignments: [] } });
    s = appReducer(s, { type: 'assignment/add', dayKey: 'lun' });
    const uid = s.schedule.days[0].assignments[0].uid;
    s = appReducer(s, { type: 'assignment/update', dayKey: 'lun', uid, patch: { territoryIds: [1] } });
    s = appReducer(s, { type: 'territory/remove', id: 1 });
    expect(s.territories).toHaveLength(0);
    expect(s.schedule.days[0].assignments[0].territoryIds).toEqual([]);
  });
  it('adds a day and an assignment with a unique uid', () => {
    let s = appReducer(emptyAppData(), { type: 'day/add', day: { key: 'lun', label: 'Lunes', assignments: [] } });
    s = appReducer(s, { type: 'assignment/add', dayKey: 'lun' });
    s = appReducer(s, { type: 'assignment/add', dayKey: 'lun' });
    const uids = s.schedule.days[0].assignments.map((a) => a.uid);
    expect(new Set(uids).size).toBe(2);
  });
  it('replaces the whole state', () => {
    const next = emptyAppData();
    next.territories = [terr(9)];
    const s = appReducer(emptyAppData(), { type: 'replace', data: next });
    expect(s.territories[0].id).toBe(9);
  });
});
