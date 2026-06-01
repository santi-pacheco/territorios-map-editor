import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { MapView } from './MapView';
import { useAppData } from '../store/AppDataContext';
import type { Polygon as GeoPolygon } from 'geojson';
import type { Territory } from '../types';

function nextId(territories: Territory[]): number {
  return territories.reduce((m, t) => Math.max(m, t.id), 0) + 1;
}

// Converts a Leaflet layer's GeoJSON to a flat Polygon (first ring only).
function layerToPolygon(layer: L.Layer): GeoPolygon | null {
  const gj = (layer as L.Polygon).toGeoJSON();
  if (gj.geometry.type !== 'Polygon') return null;
  return gj.geometry as GeoPolygon;
}

function GeomanControls() {
  const map = useMap();
  const { data, dispatch } = useAppData();

  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false, drawCircleMarker: false, drawMarker: false,
      drawPolyline: false, drawRectangle: false, drawText: false,
      cutPolygon: false, rotateMode: false
    });
    map.pm.setLang('es');

    const onCreate = (e: { layer: L.Layer }) => {
      const poly = layerToPolygon(e.layer);
      map.removeLayer(e.layer); // store is the source of truth; MapView re-renders it
      if (!poly) return;
      const id = nextId(data.territories);
      dispatch({
        type: 'territory/add',
        territory: { id, name: `Territorio ${id}`, color: '#d4a857', notes: '', geometry: poly }
      });
    };
    map.on('pm:create', onCreate);

    return () => {
      map.off('pm:create', onCreate);
      map.pm.removeControls();
    };
  }, [map, data.territories, dispatch]);

  return null;
}

export function MapEditor({ highlightedIds }: { highlightedIds?: Set<number> }) {
  const { data } = useAppData();
  return (
    <MapView territories={data.territories} highlightedIds={highlightedIds}>
      <GeomanControls />
    </MapView>
  );
}
