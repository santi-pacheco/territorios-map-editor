import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Pane, useMap } from 'react-leaflet';
import L, { type LatLngExpression, type PathOptions } from 'leaflet';
import type { Assignment, Territory } from '../types';
import { colorForId } from '../lib/colors';

interface Props {
  territories: Territory[];
  assignments: Assignment[];
  highlightedIds: Set<number>;
  hoveredIds: Set<number>;
  selectedAssignment: Assignment | null;
  onAssignmentClick?: (a: Assignment) => void;
  bottomInset?: number; // px to leave clear when fitting (mobile sheet height)
}

const CITY_CENTER: [number, number] = [-33.0273, -60.6356];
const DEFAULT_ZOOM = 14;

const STYLE_DIMMED: PathOptions = {
  color: '#b8c1d4',
  weight: 0.6,
  fillColor: '#dde3ee',
  fillOpacity: 0.05,
  lineCap: 'round',
  lineJoin: 'round'
};
// When a salida is selected, non-selected territories fade further into the background
const STYLE_DIMMED_DEEP: PathOptions = {
  color: '#cdd4e0',
  weight: 0.4,
  fillColor: '#e8ecf2',
  fillOpacity: 0.02,
  lineCap: 'round',
  lineJoin: 'round'
};
const STYLE_HOVER: PathOptions = {
  color: '#1f3a68',
  weight: 2.6,
  fillColor: '#4a6da7',
  fillOpacity: 0.32,
  lineCap: 'round',
  lineJoin: 'round'
};

function styleHighlight(id: number): PathOptions {
  const c = colorForId(id);
  return {
    color: c.stroke,
    weight: 2.8,
    fillColor: c.fill,
    fillOpacity: 0.55,
    lineCap: 'round',
    lineJoin: 'round'
  };
}
// Sibling highlighted territories while another is selected — very desaturated
const STYLE_HIGHLIGHT_MUTED: PathOptions = {
  color: '#9aa6bf',
  weight: 1,
  fillColor: '#cfd6e3',
  fillOpacity: 0.18,
  lineCap: 'round',
  lineJoin: 'round'
};
function styleSelected(id: number): PathOptions {
  const c = colorForId(id);
  return {
    color: '#1f3a68',
    weight: 5,
    fillColor: c.deep,
    fillOpacity: 0.88,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'selected-poly'
  };
}

function FocusController({
  selectedAssignment,
  territories,
  bottomInset
}: {
  selectedAssignment: Assignment | null;
  territories: Territory[];
  bottomInset: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedAssignment || selectedAssignment.territoryIds.length === 0) return;
    const pts = selectedAssignment.territoryIds
      .map((id) => territories.find((x) => x.id === id))
      .filter((t): t is Territory => Boolean(t))
      .map((t) => t.centroid as [number, number]);
    if (pts.length === 0) return;
    const padBR: [number, number] = [20, Math.max(20, bottomInset + 20)];
    if (pts.length === 1) {
      const b = L.latLngBounds([
        L.latLng(pts[0][0] - 0.0015, pts[0][1] - 0.0025),
        L.latLng(pts[0][0] + 0.0015, pts[0][1] + 0.0025)
      ]);
      map.flyToBounds(b, { paddingTopLeft: [20, 20], paddingBottomRight: padBR, duration: 0.5 });
    } else {
      const b = L.latLngBounds(pts.map(([lat, lng]) => L.latLng(lat, lng)));
      map.flyToBounds(b, { paddingTopLeft: [40, 40], paddingBottomRight: [40, Math.max(40, bottomInset + 40)], duration: 0.5 });
    }
  }, [selectedAssignment, territories, map, bottomInset]);
  return null;
}

function FitBounds({ territories, bottomInset }: { territories: Territory[]; bottomInset: number }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || territories.length === 0) return;
    const bounds = L.latLngBounds([]);
    for (const t of territories) {
      const ring = t.feature.geometry.type === 'Polygon'
        ? t.feature.geometry.coordinates[0]
        : t.feature.geometry.coordinates[0][0];
      for (const [lng, lat] of ring) bounds.extend([lat, lng]);
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds, { paddingTopLeft: [30, 30], paddingBottomRight: [30, Math.max(30, bottomInset + 20)] });
      done.current = true;
    }
  }, [territories, map, bottomInset]);
  return null;
}

interface PolyData {
  id: number;
  positions: LatLngExpression[] | LatLngExpression[][];
}

function toPositions(t: Territory): LatLngExpression[] | LatLngExpression[][] {
  const g = t.feature.geometry;
  if (g.type === 'Polygon') {
    return g.coordinates.map((ring) => ring.map(([lng, lat]) => [lat, lng] as [number, number]));
  }
  return g.coordinates.flatMap((poly) =>
    poly.map((ring) => ring.map(([lng, lat]) => [lat, lng] as [number, number]))
  );
}

export function MapView({
  territories,
  assignments,
  highlightedIds,
  hoveredIds,
  selectedAssignment,
  onAssignmentClick,
  bottomInset = 0
}: Props) {
  const polys: PolyData[] = useMemo(
    () => territories.map((t) => ({ id: t.id, positions: toPositions(t) })),
    [territories]
  );

  const selectedSet = useMemo(
    () => new Set(selectedAssignment?.territoryIds ?? []),
    [selectedAssignment]
  );

  const hasSelection = selectedSet.size > 0;
  const styleFor = (id: number): PathOptions => {
    if (selectedSet.has(id)) return styleSelected(id);
    if (hoveredIds.has(id)) return STYLE_HOVER;
    if (highlightedIds.has(id)) return hasSelection ? STYLE_HIGHLIGHT_MUTED : styleHighlight(id);
    return hasSelection ? STYLE_DIMMED_DEEP : STYLE_DIMMED;
  };

  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      {/* Street labels in a custom pane above polygons (overlayPane=400) so names stay readable */}
      <Pane name="labels" style={{ zIndex: 450, pointerEvents: 'none' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          opacity={1}
        />
      </Pane>
      <FitBounds territories={territories} bottomInset={bottomInset} />
      <FocusController selectedAssignment={selectedAssignment} territories={territories} bottomInset={bottomInset} />

      {polys.map((p) => {
        const a = assignments.find((x) => x.territoryIds.includes(p.id));
        const popupHtml = a
          ? `<div style="min-width:160px"><div style="font-weight:700;color:#1f3a68;font-size:13px">Territorio ${p.id}</div><div style="font-size:12px;margin-top:4px">⏰ ${a.time} · 📍 ${a.corner}</div>${a.groups ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${/^\d/.test(a.groups) ? `Grupo ${a.groups}` : a.groups}${a.leader ? ` · ${a.leader}` : ''}</div>` : ''}${a.territoryIds.length > 1 ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">Territorios: ${a.territoryIds.join(', ')}</div>` : ''}</div>`
          : `<div style="font-weight:700;color:#1f3a68">Territorio ${p.id}</div>`;
        return (
          <Polygon
            key={p.id}
            positions={p.positions}
            pathOptions={styleFor(p.id)}
            eventHandlers={{
              add: (e) => {
                (e.target as L.Polygon).bindPopup(popupHtml);
              },
              popupopen: (e) => {
                (e.target as L.Polygon).setPopupContent(popupHtml);
              },
              click: () => {
                if (a && onAssignmentClick) onAssignmentClick(a);
              }
            }}
          />
        );
      })}
    </MapContainer>
  );
}
