import type { Polygon } from 'geojson';

export const APP_DATA_VERSION = 1;

export interface Territory {
  id: number;
  name: string;
  color: string;        // hex, e.g. "#d4a857"
  notes: string;
  geometry: Polygon;    // GeoJSON polygon as drawn
}

export interface Assignment {
  uid: string;
  time: string;
  corner: string;
  group: string;
  leader: string;
  territoryIds: number[];
}

export interface DaySchedule {
  key: string;
  label: string;
  dow?: number;         // 0..6 for "today" highlighting
  date?: string;
  assignments: Assignment[];
}

export interface AppData {
  version: number;
  territories: Territory[];
  schedule: { days: DaySchedule[] };
}

export function emptyAppData(): AppData {
  return { version: APP_DATA_VERSION, territories: [], schedule: { days: [] } };
}
