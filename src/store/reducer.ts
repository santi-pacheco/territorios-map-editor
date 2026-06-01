import type { AppData, Assignment, DaySchedule, Territory } from '../types';

export type Action =
  | { type: 'replace'; data: AppData }
  | { type: 'territory/add'; territory: Territory }
  | { type: 'territory/update'; id: number; patch: Partial<Territory> }
  | { type: 'territory/remove'; id: number }
  | { type: 'day/add'; day: DaySchedule }
  | { type: 'day/update'; key: string; patch: Partial<DaySchedule> }
  | { type: 'day/remove'; key: string }
  | { type: 'assignment/add'; dayKey: string }
  | { type: 'assignment/update'; dayKey: string; uid: string; patch: Partial<Assignment> }
  | { type: 'assignment/remove'; dayKey: string; uid: string };

let uidCounter = 0;
function newUid(): string {
  uidCounter += 1;
  return `a${Date.now().toString(36)}-${uidCounter}`;
}

function emptyAssignment(): Assignment {
  return { uid: newUid(), time: '', corner: '', group: '', leader: '', territoryIds: [] };
}

function mapDay(data: AppData, key: string, fn: (d: DaySchedule) => DaySchedule): AppData {
  return { ...data, schedule: { days: data.schedule.days.map((d) => (d.key === key ? fn(d) : d)) } };
}

export function appReducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'replace':
      return action.data;
    case 'territory/add':
      return { ...state, territories: [...state.territories, action.territory] };
    case 'territory/update':
      return { ...state, territories: state.territories.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)) };
    case 'territory/remove':
      return {
        ...state,
        territories: state.territories.filter((t) => t.id !== action.id),
        schedule: {
          days: state.schedule.days.map((d) => ({
            ...d,
            assignments: d.assignments.map((a) => ({
              ...a,
              territoryIds: a.territoryIds.filter((id) => id !== action.id)
            }))
          }))
        }
      };
    case 'day/add':
      return { ...state, schedule: { days: [...state.schedule.days, action.day] } };
    case 'day/update':
      return mapDay(state, action.key, (d) => ({ ...d, ...action.patch }));
    case 'day/remove':
      return { ...state, schedule: { days: state.schedule.days.filter((d) => d.key !== action.key) } };
    case 'assignment/add':
      return mapDay(state, action.dayKey, (d) => ({ ...d, assignments: [...d.assignments, emptyAssignment()] }));
    case 'assignment/update':
      return mapDay(state, action.dayKey, (d) => ({
        ...d,
        assignments: d.assignments.map((a) => (a.uid === action.uid ? { ...a, ...action.patch } : a))
      }));
    case 'assignment/remove':
      return mapDay(state, action.dayKey, (d) => ({
        ...d,
        assignments: d.assignments.filter((a) => a.uid !== action.uid)
      }));
    default:
      return state;
  }
}
