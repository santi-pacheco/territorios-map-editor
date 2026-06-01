import { useAppData } from '../store/AppDataContext';
import type { Assignment } from '../types';

function TerritoryPicker({
  selected, territories, onChange
}: {
  selected: number[];
  territories: { id: number; name: string }[];
  onChange: (ids: number[]) => void;
}) {
  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  return (
    <div className="flex flex-wrap gap-1">
      {territories.map((t) => (
        <button
          key={t.id}
          onClick={() => toggle(t.id)}
          className={`rounded-full px-2 py-0.5 text-xs border ${selected.includes(t.id) ? 'bg-jw-navy text-white border-jw-navy' : 'border-jw-navy/30 text-jw-navy'}`}
        >{t.id}</button>
      ))}
      {territories.length === 0 && <span className="text-xs text-jw-mute">Sin territorios aún</span>}
    </div>
  );
}

export function ScheduleEditor() {
  const { data, dispatch } = useAppData();
  const territories = data.territories.map((t) => ({ id: t.id, name: t.name }));

  function addDay() {
    const key = `d${Date.now().toString(36)}`;
    dispatch({ type: 'day/add', day: { key, label: 'Nuevo día', assignments: [] } });
  }

  return (
    <div className="overflow-y-auto h-full p-3 space-y-4">
      <button onClick={addDay} className="rounded-xl bg-jw-navy px-3 py-2 text-sm font-semibold text-white">+ Agregar día</button>
      {data.schedule.days.map((day) => (
        <div key={day.key} className="rounded-xl border border-jw-navy/15 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              className="font-semibold text-jw-navy rounded border border-jw-navy/15 px-2 py-1"
              value={day.label}
              onChange={(e) => dispatch({ type: 'day/update', key: day.key, patch: { label: e.target.value } })}
            />
            <input
              type="number" min={0} max={6} placeholder="DOW"
              className="w-16 rounded border border-jw-navy/15 px-2 py-1 text-sm"
              value={day.dow ?? ''}
              onChange={(e) => dispatch({ type: 'day/update', key: day.key, patch: { dow: e.target.value === '' ? undefined : Number(e.target.value) } })}
            />
            <button onClick={() => dispatch({ type: 'day/remove', key: day.key })} className="ml-auto text-red-600">Eliminar día</button>
          </div>
          {day.assignments.map((a: Assignment) => (
            <div key={a.uid} className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-2 items-center">
              <input className="rounded border border-jw-navy/15 px-2 py-1 text-sm" placeholder="Hora" value={a.time}
                onChange={(e) => dispatch({ type: 'assignment/update', dayKey: day.key, uid: a.uid, patch: { time: e.target.value } })} />
              <input className="rounded border border-jw-navy/15 px-2 py-1 text-sm" placeholder="Esquina" value={a.corner}
                onChange={(e) => dispatch({ type: 'assignment/update', dayKey: day.key, uid: a.uid, patch: { corner: e.target.value } })} />
              <input className="rounded border border-jw-navy/15 px-2 py-1 text-sm" placeholder="Grupo" value={a.group}
                onChange={(e) => dispatch({ type: 'assignment/update', dayKey: day.key, uid: a.uid, patch: { group: e.target.value } })} />
              <input className="rounded border border-jw-navy/15 px-2 py-1 text-sm" placeholder="Responsable" value={a.leader}
                onChange={(e) => dispatch({ type: 'assignment/update', dayKey: day.key, uid: a.uid, patch: { leader: e.target.value } })} />
              <button onClick={() => dispatch({ type: 'assignment/remove', dayKey: day.key, uid: a.uid })} className="text-red-600">✕</button>
              <div className="col-span-5">
                <TerritoryPicker selected={a.territoryIds} territories={territories}
                  onChange={(ids) => dispatch({ type: 'assignment/update', dayKey: day.key, uid: a.uid, patch: { territoryIds: ids } })} />
              </div>
            </div>
          ))}
          <button onClick={() => dispatch({ type: 'assignment/add', dayKey: day.key })} className="text-sm text-jw-navy font-semibold">+ Agregar salida</button>
        </div>
      ))}
    </div>
  );
}
