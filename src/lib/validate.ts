import type { AppData } from '../types';

function isPolygon(g: unknown): boolean {
  return !!g && typeof g === 'object'
    && (g as { type?: string }).type === 'Polygon'
    && Array.isArray((g as { coordinates?: unknown }).coordinates);
}

export function parseAppData(raw: string): AppData {
  const obj = JSON.parse(raw) as unknown;
  if (!obj || typeof obj !== 'object') throw new Error('Datos inválidos');
  const o = obj as Record<string, unknown>;
  if (typeof o.version !== 'number') throw new Error('Falta version');
  if (!Array.isArray(o.territories)) throw new Error('Falta territories');
  for (const t of o.territories as Record<string, unknown>[]) {
    if (typeof t.id !== 'number') throw new Error('territory.id inválido');
    if (!isPolygon(t.geometry)) throw new Error('territory.geometry inválido');
  }
  const sched = o.schedule as { days?: unknown } | undefined;
  if (!sched || !Array.isArray(sched.days)) throw new Error('Falta schedule.days');
  return obj as AppData;
}
