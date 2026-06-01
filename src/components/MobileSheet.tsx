import { useEffect, useRef, useState } from 'react';
import { DaySwitcher } from './DaySwitcher';
import { ScheduleList } from './ScheduleList';
import type { Assignment, DaySchedule, Territory } from '../types';

interface Props {
  days: DaySchedule[];
  selectedKey: string;
  onSelectDay: (k: string) => void;
  todayDow: number;
  currentDay: DaySchedule | undefined;
  territories: Territory[];
  selectedAssignment: Assignment | null;
  onSelectAssignment: (a: Assignment | null) => void;
  loading: boolean;
  error: string | null;
  expanded: boolean;
  onToggleExpanded: (next: boolean) => void;
}

const ChevronUp = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 15l6-6 6 6" />
  </svg>
);

export const PEEK_HEIGHT = 168;
export const FULL_HEIGHT_VH = 72;

function fullPx(): number {
  if (typeof window === 'undefined') return 600;
  return Math.round(window.innerHeight * (FULL_HEIGHT_VH / 100));
}

export function MobileSheet({
  days,
  selectedKey,
  onSelectDay,
  todayDow,
  currentDay,
  territories,
  selectedAssignment,
  onSelectAssignment,
  loading,
  error,
  expanded,
  onToggleExpanded
}: Props) {
  const count = currentDay?.assignments.length ?? 0;
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number; moved: boolean } | null>(null);
  const [dragHeight, setDragHeightState] = useState<number | null>(null);
  const dragHeightRef = useRef<number | null>(null);

  // Always-current refs so listeners attached once still see latest values
  const expandedRef = useRef(expanded);
  const onToggleRef = useRef(onToggleExpanded);
  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);
  useEffect(() => {
    onToggleRef.current = onToggleExpanded;
  }, [onToggleExpanded]);

  const setDH = (v: number | null) => {
    dragHeightRef.current = v;
    setDragHeightState(v);
  };

  // Native touch/mouse listeners — attach ONCE to avoid race with re-renders
  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    let lastTouchTs = 0;
    const TOUCH_GUARD_MS = 800;
    const MOVE_THRESHOLD = 8;

    const getHeight = () =>
      dragHeightRef.current !== null
        ? dragHeightRef.current
        : expandedRef.current
        ? fullPx()
        : PEEK_HEIGHT;

    const startAt = (y: number) => {
      dragRef.current = { startY: y, startHeight: getHeight(), moved: false };
    };
    const moveAt = (y: number, ev: Event) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - y;
      if (Math.abs(delta) > MOVE_THRESHOLD) {
        dragRef.current.moved = true;
        ev.preventDefault();
        const max = Math.round(window.innerHeight * 0.9);
        const next = Math.max(PEEK_HEIGHT, Math.min(max, dragRef.current.startHeight + delta));
        setDH(next);
      }
    };
    const endDrag = () => {
      if (!dragRef.current) return;
      const moved = dragRef.current.moved;
      const startHeight = dragRef.current.startHeight;
      dragRef.current = null;
      if (!moved) {
        // tap → toggle
        setDH(null);
        onToggleRef.current(!expandedRef.current);
        return;
      }
      const finalHeight = dragHeightRef.current ?? startHeight;
      const mid = (PEEK_HEIGHT + fullPx()) / 2;
      const shouldExpand = finalHeight > mid;
      setDH(null);
      onToggleRef.current(shouldExpand);
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchTs = Date.now();
      startAt(e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      lastTouchTs = Date.now();
      moveAt(e.touches[0].clientY, e);
    };
    const onTouchEnd = () => {
      lastTouchTs = Date.now();
      endDrag();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (Date.now() - lastTouchTs < TOUCH_GUARD_MS) return;
      startAt(e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (Date.now() - lastTouchTs < TOUCH_GUARD_MS) return;
      moveAt(e.clientY, e);
    };
    const onMouseUp = () => {
      if (Date.now() - lastTouchTs < TOUCH_GUARD_MS) return;
      endDrag();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []); // attach once

  const isDragging = dragHeight !== null;
  const heightPx = dragHeight !== null ? dragHeight : expanded ? fullPx() : PEEK_HEIGHT;

  return (
    <div
      className={[
        'lg:hidden absolute inset-x-0 bottom-0 z-[450] bg-white/98 backdrop-blur',
        'rounded-t-3xl border-t border-jw-navy/15 shadow-[0_-12px_40px_rgba(15,25,55,0.18)]',
        'flex flex-col overflow-hidden',
        isDragging ? '' : 'transition-[height] duration-200 ease-out'
      ].join(' ')}
      style={{ height: `${heightPx}px` }}
    >
      <div
        ref={handleRef}
        role="button"
        tabIndex={0}
        aria-label={expanded ? 'Colapsar panel' : 'Expandir panel'}
        className="w-full px-4 pt-2 pb-2.5 flex items-center justify-between gap-3 select-none cursor-grab active:cursor-grabbing active:bg-jw-sand/40 touch-none"
      >
        <div className="flex flex-col items-center gap-1 grow">
          <span className="h-1.5 w-14 rounded-full bg-jw-navy/40" />
          <div className="flex items-center gap-1.5 text-jw-navy/80">
            <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
              {expanded ? 'Tocá o arrastrá para bajar' : `Tocá o arrastrá para ver ${count} salida${count === 1 ? '' : 's'}`}
            </span>
            <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      <div className="px-4 pb-1.5 flex items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-bold text-jw-navy tracking-tight truncate">
          {currentDay?.label ?? '—'}
        </h2>
        <span className="text-[11px] text-jw-mute font-medium shrink-0">
          {currentDay?.date ? `${currentDay.date} · ` : ''}
          {count} salida{count === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="flex gap-2 px-4 pb-1">
          <DaySwitcher
            days={days}
            selectedKey={selectedKey}
            onSelect={onSelectDay}
            todayDow={todayDow}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 pb-5 pt-2 border-t border-jw-navy/10">
        {loading ? (
          <SkeletonList />
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
            {error}
          </div>
        ) : (
          <ScheduleList
            assignments={currentDay?.assignments ?? []}
            territories={territories}
            selectedUid={selectedAssignment?.uid ?? null}
            onHover={() => undefined}
            onSelect={onSelectAssignment}
          />
        )}
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
