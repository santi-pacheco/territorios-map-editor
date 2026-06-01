export interface TerritoryColor {
  base: string;     // base fill (light)
  fill: string;     // highlight fill
  stroke: string;   // outline
  deep: string;     // selected fill (darker)
  ink: string;      // text on color
}

// 8 hues tuned warm + JW-adjacent. Each entry is { fill, stroke, deep }.
const PALETTE: TerritoryColor[] = [
  { base: '#fbe7b4', fill: '#d4a857', stroke: '#8a6a26', deep: '#b6862d', ink: '#1f1300' }, // gold
  { base: '#f4cdbd', fill: '#c2664a', stroke: '#7a3a25', deep: '#9c4d36', ink: '#fff' },    // terracotta
  { base: '#b9e2da', fill: '#4a9d8f', stroke: '#1f5a52', deep: '#357a6f', ink: '#fff' },    // teal
  { base: '#d8c8e6', fill: '#8b6dad', stroke: '#4d3868', deep: '#6e5290', ink: '#fff' },    // lavender
  { base: '#c8dcab', fill: '#789e3e', stroke: '#3f5520', deep: '#5b7c2d', ink: '#fff' },    // olive
  { base: '#f0c7d5', fill: '#c97f9c', stroke: '#6f3f54', deep: '#a35f7a', ink: '#fff' },    // mauve
  { base: '#bdd1ec', fill: '#5a7ab8', stroke: '#293e6e', deep: '#3f5e98', ink: '#fff' },    // periwinkle
  { base: '#f8d5a0', fill: '#e09e3c', stroke: '#7c521b', deep: '#b07a26', ink: '#fff' }     // amber
];

export function colorForId(id: number): TerritoryColor {
  const h = Math.abs(id * 2654435761) % PALETTE.length;
  return PALETTE[h];
}

export function colorForFirst(ids: number[]): TerritoryColor {
  return colorForId(ids[0] ?? 0);
}
