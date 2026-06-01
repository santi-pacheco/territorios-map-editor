import { APP_DATA_VERSION, type AppData } from '../types';

// Three small sample polygons near central Rosario + a sample schedule.
export function demoData(): AppData {
  return {
    version: APP_DATA_VERSION,
    territories: [
      { id: 1, name: 'Centro', color: '#d4a857', notes: 'Zona céntrica',
        geometry: { type: 'Polygon', coordinates: [[[-60.6450,-32.9480],[-60.6390,-32.9480],[-60.6390,-32.9430],[-60.6450,-32.9430],[-60.6450,-32.9480]]] } },
      { id: 2, name: 'Pichincha', color: '#4a9d8f', notes: '',
        geometry: { type: 'Polygon', coordinates: [[[-60.6520,-32.9430],[-60.6450,-32.9430],[-60.6450,-32.9380],[-60.6520,-32.9380],[-60.6520,-32.9430]]] } },
      { id: 3, name: 'Echesortu', color: '#c2664a', notes: '',
        geometry: { type: 'Polygon', coordinates: [[[-60.6600,-32.9520],[-60.6520,-32.9520],[-60.6520,-32.9460],[-60.6600,-32.9460],[-60.6600,-32.9520]]] } }
    ],
    schedule: {
      days: [
        { key: 'sab', label: 'Sábado', dow: 6, assignments: [
          { uid: 'demo-1', time: '09:00', corner: 'Córdoba y Corrientes', group: '1', leader: 'Hno. Pérez', territoryIds: [1] },
          { uid: 'demo-2', time: '16:00', corner: 'Oroño y Pellegrini', group: '2', leader: 'Hna. Gómez', territoryIds: [2, 3] }
        ] },
        { key: 'dom', label: 'Domingo', dow: 0, assignments: [
          { uid: 'demo-3', time: '10:00', corner: 'Plaza Pringles', group: '1', leader: 'Hno. López', territoryIds: [3] }
        ] }
      ]
    }
  };
}
