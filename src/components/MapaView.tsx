import { useEffect, useMemo, useState } from 'react';
import { MapView } from './MapView';
import { useAppData } from '../store/AppDataContext';
import { todayDow } from '../lib/days';
import type { Assignment, DaySchedule } from '../types';

// Read-only viewing experience: pick a day, see its salidas, tap one to focus the map.
export function MapaView() {
  const { data } = useAppData();
  const days = data.schedule.days;
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // Default the selected day to today (by dow), else the first day. Keep valid if data changes.
  useEffect(() => {
    if (days.length === 0) { setSelectedDayKey(null); return; }
    if (selectedDayKey && days.some((d) => d.key === selectedDayKey)) return;
    const today = days.find((d) => d.dow === todayDow());
    setSelectedDayKey((today ?? days[0]).key);
  }, [days, selectedDayKey]);

  const currentDay: DaySchedule | undefined = useMemo(
    () => days.find((d) => d.key === selectedDayKey),
    [days, selectedDayKey]
  );

  const selectedAssignment = useMemo(
    () => currentDay?.assignments.find((a) => a.uid === selectedUid) ?? null,
    [currentDay, selectedUid]
  );

  // Highlight: the selected salida's territories, or the whole day's if none selected.
  const highlightedIds = useMemo(() => {
    const s = new Set<number>();
    const src = selectedAssignment ? [selectedAssignment] : currentDay?.assignments ?? [];
    src.forEach((a) => a.territoryIds.forEach((id) => s.add(id)));
    return s;
  }, [currentDay, selectedAssignment]);

  const focusIds = useMemo(
    () => (selectedAssignment ? selectedAssignment.territoryIds : undefined),
    [selectedAssignment]
  );

  function selectDay(key: string) {
    setSelectedDayKey(key);
    setSelectedUid(null);
  }

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-[1fr_380px]">
      <div className="h-[45vh] lg:h-full min-h-0 order-1 lg:order-none">
        <MapView
          territories={data.territories}
          highlightedIds={highlightedIds}
          focusIds={focusIds}
          onPolygonClick={(t) => {
            const a = currentDay?.assignments.find((x) => x.territoryIds.includes(t.id));
            if (a) setSelectedUid(a.uid);
          }}
        />
      </div>

      <aside className="flex-1 min-h-0 lg:h-full overflow-y-auto bg-white border-t lg:border-t-0 lg:border-l border-jw-navy/10 order-2 lg:order-none">
        {days.length === 0 ? (
          <div className="p-6 text-center text-sm text-jw-mute">
            Todavía no hay agenda cargada. Un administrador puede agregar días y salidas.
          </div>
        ) : (
          <div className="p-3 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {days.map((d) => {
                const isToday = d.dow === todayDow();
                const active = d.key === selectedDayKey;
                return (
                  <button
                    key={d.key}
                    onClick={() => selectDay(d.key)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold border ${
                      active ? 'bg-jw-navy text-white border-jw-navy' : 'bg-white text-jw-navy border-jw-navy/20'
                    }`}
                  >
                    {d.label}
                    {isToday && <span className={`ml-1.5 text-[10px] ${active ? 'text-jw-gold' : 'text-emerald-600'}`}>hoy</span>}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-jw-mute">
              {currentDay?.assignments.length ?? 0} salida{(currentDay?.assignments.length ?? 0) === 1 ? '' : 's'}
            </div>

            <ul className="space-y-2">
              {currentDay?.assignments.map((a) => (
                <SalidaCard
                  key={a.uid}
                  assignment={a}
                  active={a.uid === selectedUid}
                  onClick={() => setSelectedUid((prev) => (prev === a.uid ? null : a.uid))}
                />
              ))}
              {currentDay && currentDay.assignments.length === 0 && (
                <li className="text-sm text-jw-mute">No hay salidas para este día.</li>
              )}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function SalidaCard({ assignment: a, active, onClick }: { assignment: Assignment; active: boolean; onClick: () => void }) {
  const grupo = a.group ? (/^\d/.test(a.group) ? `Grupo ${a.group}` : a.group) : '';
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl border p-3 transition ${
          active ? 'border-jw-navy bg-jw-sand/50 shadow-sm' : 'border-jw-navy/15 bg-white hover:bg-jw-sand/30'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-jw-navy">{a.time || '—'}</span>
          {a.territoryIds.length > 0 && (
            <span className="ml-auto rounded-full bg-jw-navy text-white text-[10px] font-bold px-2 py-0.5">
              {a.territoryIds.length === 1 ? `Territorio ${a.territoryIds[0]}` : `Territorios ${a.territoryIds.join(' · ')}`}
            </span>
          )}
        </div>
        {a.corner && <div className="mt-1 text-sm font-semibold text-jw-ink">📍 {a.corner}</div>}
        {(grupo || a.leader) && (
          <div className="mt-0.5 text-xs text-jw-mute">
            {grupo}
            {grupo && a.leader && ' · '}
            {a.leader}
          </div>
        )}
      </button>
    </li>
  );
}
