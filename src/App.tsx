import { useEffect, useMemo, useState } from 'react';
import { MapView } from './components/MapView';
import { DaySwitcher } from './components/DaySwitcher';
import { ScheduleList } from './components/ScheduleList';
import { MobileSheet, PEEK_HEIGHT, FULL_HEIGHT_VH } from './components/MobileSheet';
import { useTerritories } from './data/useTerritories';
import { useSchedule } from './data/useSchedule';
import { todayDow } from './lib/days';
import { colorForId } from './lib/colors';
import type { Assignment } from './types';

const Logo = () => (
  <div className="flex items-center gap-2.5 min-w-0">
    <div className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-jw-navy text-jw-gold shadow-md">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 3 L20 7 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V7 Z" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    </div>
    <div className="leading-tight min-w-0">
      <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase text-jw-gold truncate">Cong. Norte Villa Diego</div>
      <div className="text-[13px] sm:text-[15px] font-bold text-white truncate">Territorios · Salidas al Ministerio</div>
    </div>
  </div>
);

const LiveDot = ({ ageMs }: { ageMs: number | null }) => {
  if (ageMs == null) return null;
  const fresh = ageMs < 60_000;
  return (
    <div className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase shrink-0 ${fresh ? 'text-emerald-300' : 'text-white/60'}`}>
      <span className={`h-2 w-2 rounded-full ${fresh ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-white/40'}`} />
      <span className="hidden xs:inline">{fresh ? 'En vivo' : 'Sync'}</span>
    </div>
  );
};

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 1023px)').matches;
}

export default function App() {
  const territoriesQ = useTerritories();
  const scheduleQ = useSchedule();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [hoveredIds, setHoveredIds] = useState<Set<number>>(new Set());
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [now, setNow] = useState(Date.now());
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(true);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const days = scheduleQ.data?.days ?? [];

  useEffect(() => {
    if (!days.length) return;
    if (selectedDayKey && days.some((d) => d.key === selectedDayKey)) return;
    const today = todayDow();
    const match = days.find((d) => d.dow === today);
    setSelectedDayKey((match ?? days[0]).key);
  }, [days, selectedDayKey]);

  const currentDay = useMemo(
    () => days.find((d) => d.key === selectedDayKey),
    [days, selectedDayKey]
  );

  const highlightedIds = useMemo(() => {
    const s = new Set<number>();
    currentDay?.assignments.forEach((a) => a.territoryIds.forEach((id) => s.add(id)));
    return s;
  }, [currentDay]);

  const handleDayChange = (key: string) => {
    setSelectedDayKey(key);
    setSelectedAssignment(null);
    setHoveredIds(new Set());
    setMobileSheetExpanded(true);
  };

  const handleHover = (ids: number[]) => {
    setHoveredIds(new Set(ids));
  };

  const handleSelectFromSheet = (a: Assignment | null) => {
    setSelectedAssignment(a);
    if (a) setMobileSheetExpanded(false); // give the user the map view
  };

  const handlePolygonClick = (a: Assignment) => {
    setSelectedAssignment(a);
    setMobileSheetExpanded(false);
  };

  const ageMs = scheduleQ.lastFetched ? now - scheduleQ.lastFetched : null;
  const bottomInset = isMobileViewport()
    ? mobileSheetExpanded
      ? Math.round(window.innerHeight * (FULL_HEIGHT_VH / 100))
      : PEEK_HEIGHT
    : 0;

  return (
    <div className="flex h-full flex-col bg-jw-ivory">
      <header className="bg-gradient-to-r from-jw-navy-dark via-jw-navy to-jw-blue text-white shadow-[0_8px_24px_rgba(15,25,55,0.18)] z-[500]">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 sm:py-3">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {scheduleQ.data?.weekLabel && (
              <div className="hidden md:block text-right leading-tight">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60 font-semibold">Semana</div>
                <div className="text-[13px] font-semibold text-white">{scheduleQ.data.weekLabel}</div>
              </div>
            )}
            <LiveDot ageMs={ageMs} />
          </div>
        </div>
      </header>

      <main className="grid flex-1 min-h-0 lg:grid-cols-[380px_1fr]">
        <aside className="hidden lg:flex flex-col min-h-0 border-r border-jw-navy/10 bg-white/80 backdrop-blur">
          <div className="px-5 pt-5 pb-3">
            <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-jw-mute mb-2">Día de servicio</div>
            <DaySwitcher
              days={days}
              selectedKey={selectedDayKey ?? ''}
              onSelect={handleDayChange}
              todayDow={todayDow()}
            />
          </div>
          <div className="px-5 pt-2 pb-1 flex items-baseline justify-between">
            <h2 className="text-[18px] font-bold text-jw-navy tracking-tight">
              {currentDay?.label ?? '—'}
            </h2>
            <span className="text-[11px] text-jw-mute font-medium">
              {currentDay?.date ? `${currentDay.date} · ` : ''}
              {currentDay?.assignments.length ?? 0} salida{(currentDay?.assignments.length ?? 0) === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 pt-2 pb-5">
            {scheduleQ.loading ? (
              <SkeletonList />
            ) : scheduleQ.error ? (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
                No se pudo cargar la planilla: {scheduleQ.error}
              </div>
            ) : (
              <ScheduleList
                assignments={currentDay?.assignments ?? []}
                territories={territoriesQ.data ?? []}
                selectedUid={selectedAssignment?.uid ?? null}
                onHover={handleHover}
                onSelect={setSelectedAssignment}
              />
            )}
          </div>
          <footer className="px-5 py-3 border-t border-jw-navy/10 text-[10px] text-jw-mute leading-relaxed bg-jw-sand/40">
            Datos en vivo desde Google Sheets · Tiles © CARTO
          </footer>
        </aside>

        <section className="relative min-h-0">
          {territoriesQ.loading ? (
            <div className="grid h-full place-items-center text-jw-mute text-sm">Cargando mapa…</div>
          ) : territoriesQ.error ? (
            <div className="grid h-full place-items-center text-red-600 text-sm">Error al cargar territorios: {territoriesQ.error}</div>
          ) : (
            <MapView
              territories={territoriesQ.data ?? []}
              assignments={currentDay?.assignments ?? []}
              highlightedIds={highlightedIds}
              hoveredIds={hoveredIds}
              selectedAssignment={selectedAssignment}
              onAssignmentClick={handlePolygonClick}
              bottomInset={bottomInset}
            />
          )}

          {/* Mobile sticky selection pill */}
          {selectedAssignment && (
            <MobileSelectionPill
              assignment={selectedAssignment}
              onClear={() => setSelectedAssignment(null)}
              onExpand={() => setMobileSheetExpanded(true)}
            />
          )}

          {selectedAssignment && (
            <DesktopSelectionChip
              assignment={selectedAssignment}
              onClear={() => setSelectedAssignment(null)}
            />
          )}

          <Legend count={highlightedIds.size} />

          <MobileSheet
            days={days}
            selectedKey={selectedDayKey ?? ''}
            onSelectDay={handleDayChange}
            todayDow={todayDow()}
            currentDay={currentDay}
            territories={territoriesQ.data ?? []}
            selectedAssignment={selectedAssignment}
            onSelectAssignment={handleSelectFromSheet}
            loading={scheduleQ.loading}
            error={scheduleQ.error}
            expanded={mobileSheetExpanded}
            onToggleExpanded={setMobileSheetExpanded}
          />
        </section>
      </main>
    </div>
  );
}

function MobileSelectionPill({
  assignment,
  onClear,
  onExpand
}: {
  assignment: Assignment;
  onClear: () => void;
  onExpand: () => void;
}) {
  const color = assignment.territoryIds.length > 0 ? colorForId(assignment.territoryIds[0]) : null;
  return (
    <div className="lg:hidden absolute top-3 inset-x-3 z-[460] fade-in">
      <div
        className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,25,55,0.22)] border overflow-hidden flex items-center"
        style={{ borderColor: color ? color.fill : '#d4a857' }}
      >
        <button
          type="button"
          onClick={onExpand}
          className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left active:bg-jw-sand/40 touch-manipulation min-w-0"
        >
          <span
            className="grid place-items-center h-9 w-9 shrink-0 rounded-xl text-[12px] font-bold"
            style={{ background: color ? color.fill : '#d4a857', color: color ? color.ink : '#1f1300' }}
          >
            {assignment.territoryIds.length > 0 ? assignment.territoryIds.join('·') : '—'}
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[11px] font-semibold text-jw-mute uppercase tracking-wider">{assignment.time}</span>
            <span className="text-[13px] font-bold text-jw-ink truncate">{assignment.corner}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Cerrar selección"
          className="grid place-items-center h-full px-3 py-3 text-jw-mute active:bg-jw-sand/60 touch-manipulation"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DesktopSelectionChip({ assignment, onClear }: { assignment: Assignment; onClear: () => void }) {
  return (
    <div className="hidden lg:block absolute right-4 top-4 z-[400] max-w-[300px] rounded-2xl bg-white/95 backdrop-blur shadow-[0_12px_32px_rgba(15,25,55,0.22)] border border-jw-gold/40 overflow-hidden fade-in">
      <div className="bg-gradient-to-r from-jw-gold to-jw-gold-soft px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1f1300]">Salida seleccionada</span>
        <button onClick={onClear} aria-label="Cerrar" className="text-[#1f1300]/70 hover:text-[#1f1300] text-base leading-none">×</button>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold text-jw-navy">{assignment.time}</span>
          {assignment.territoryIds.length > 0 && (
            <span className="ml-auto rounded-full bg-jw-navy text-white text-[10px] font-bold px-2 py-0.5">
              {assignment.territoryIds.length === 1 ? `Territorio ${assignment.territoryIds[0]}` : `Territorios ${assignment.territoryIds.join(' · ')}`}
            </span>
          )}
        </div>
        <div className="text-[13px] font-semibold text-jw-ink">📍 {assignment.corner}</div>
        {(assignment.leader || assignment.groups) && (
          <div className="text-[11px] text-jw-mute">
            {assignment.groups && <span>{/^\d/.test(assignment.groups) ? `Grupo ${assignment.groups}` : assignment.groups}</span>}
            {assignment.groups && assignment.leader && <span> · </span>}
            {assignment.leader}
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ count }: { count: number }) {
  return (
    <div className="hidden lg:block absolute left-4 bottom-4 z-[400] rounded-2xl bg-white/95 backdrop-blur shadow-[0_10px_30px_rgba(20,30,60,0.15)] border border-jw-navy/10 px-4 py-3 text-[11px] text-jw-ink">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="flex gap-0.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: '#d4a857', border: '1px solid #8a6a26' }} />
          <span className="h-3 w-3 rounded-sm" style={{ background: '#4a9d8f', border: '1px solid #1f5a52' }} />
          <span className="h-3 w-3 rounded-sm" style={{ background: '#c2664a', border: '1px solid #7a3a25' }} />
        </span>
        <span className="font-semibold text-jw-navy">{count} territorio{count === 1 ? '' : 's'} hoy</span>
      </div>
      <div className="flex items-center gap-2 text-jw-mute">
        <span className="h-3 w-3 rounded-sm" style={{ background: 'rgba(221,227,238,0.4)', border: '1px solid #b8c1d4' }} />
        <span>Resto</span>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-jw-sand/60 animate-pulse" />
      ))}
    </div>
  );
}
