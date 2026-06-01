import type { Feature, Polygon, MultiPolygon } from 'geojson';

export type TerritoryGeometry = Polygon | MultiPolygon;

export interface Territory {
  id: number;
  feature: Feature<TerritoryGeometry, { id: number; name: string }>;
  centroid: [number, number];
}

export interface Assignment {
  uid: string;
  time: string;
  corner: string;
  groups: string;
  leader: string;
  territoryIds: number[];
}

export interface DaySchedule {
  key: string;
  label: string;
  short: string;
  date?: string;
  dow?: number; // JS getDay value if known (0..6)
  assignments: Assignment[];
}

export interface ScheduleData {
  weekLabel: string | null;
  days: DaySchedule[];
}

export interface GeocodedPoint {
  corner: string;
  lat: number;
  lng: number;
}
