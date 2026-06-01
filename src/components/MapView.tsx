import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Pane, useMap } from 'react-leaflet';
import L, { type LatLngExpression, type PathOptions } from 'leaflet';
import type { Territory } from '../types';

const ROSARIO_CENTER: [number, number] = [-32.9468, -60.6393];
const DEFAULT_ZOOM = 13;

function styleFor(t: Territory, highlighted: boolean): PathOptions {
  return {
    color: t.color,
    weight: highlighted ? 3 : 1.5,
    fillColor: t.color,
    fillOpacity: highlighted ? 0.55 : 0.2,
    lineCap: 'round',
    lineJoin: 'round'
  };
}

function toPositions(t: Territory): LatLngExpression[] {
  return t.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
}

function FitBounds({ territories }: { territories: Territory[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || territories.length === 0) return;
    const bounds = L.latLngBounds([]);
    for (const t of territories) for (const [lng, lat] of t.geometry.coordinates[0]) bounds.extend([lat, lng]);
    if (bounds.isValid()) { map.fitBounds(bounds, { padding: [30, 30] }); done.current = true; }
  }, [territories, map]);
  return null;
}

// Flies the map to the given territories whenever focusIds changes (e.g. a salida is selected).
function FocusController({ territories, focusIds }: { territories: Territory[]; focusIds?: number[] }) {
  const map = useMap();
  useEffect(() => {
    if (!focusIds || focusIds.length === 0) return;
    const sel = territories.filter((t) => focusIds.includes(t.id));
    if (sel.length === 0) return;
    const bounds = L.latLngBounds([]);
    for (const t of sel) for (const [lng, lat] of t.geometry.coordinates[0]) bounds.extend([lat, lng]);
    if (bounds.isValid()) map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 16, duration: 0.5 });
  }, [focusIds, territories, map]);
  return null;
}

export function MapView({
  territories,
  highlightedIds,
  focusIds,
  onPolygonClick,
  children
}: {
  territories: Territory[];
  highlightedIds?: Set<number>;
  focusIds?: number[];
  onPolygonClick?: (t: Territory) => void;
  children?: React.ReactNode;
}) {
  const hi = highlightedIds ?? new Set<number>();
  const polys = useMemo(() => territories.map((t) => ({ t, positions: toPositions(t) })), [territories]);

  return (
    <MapContainer center={ROSARIO_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; OSM · &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <Pane name="labels" style={{ zIndex: 450, pointerEvents: 'none' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={19} />
      </Pane>
      <FitBounds territories={territories} />
      <FocusController territories={territories} focusIds={focusIds} />
      {polys.map(({ t, positions }) => (
        <Polygon
          key={t.id}
          positions={positions}
          pathOptions={styleFor(t, hi.has(t.id))}
          eventHandlers={{
            add: (e) => (e.target as L.Polygon).bindTooltip(`${t.id} · ${t.name}`),
            click: () => onPolygonClick?.(t)
          }}
        />
      ))}
      {children}
    </MapContainer>
  );
}
