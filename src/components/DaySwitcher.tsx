import type { DaySchedule } from '../types';

interface Props {
  days: DaySchedule[];
  selectedKey: string;
  onSelect: (key: string) => void;
  todayDow: number;
}

export function DaySwitcher({ days, selectedKey, onSelect, todayDow }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {days.map((d) => {
        const isSel = d.key === selectedKey;
        const isToday = d.dow === todayDow;
        return (
          <button
            key={d.key}
            onClick={() => onSelect(d.key)}
            className={[
              'group relative flex flex-col items-start gap-0.5 rounded-2xl px-4 py-2.5 text-left transition-all duration-200',
              'border focus:outline-none focus-visible:ring-2 focus-visible:ring-jw-gold/60',
              isSel
                ? 'bg-jw-navy text-white border-jw-navy shadow-[0_8px_24px_rgba(31,58,104,0.25)]'
                : 'bg-white text-jw-navy border-jw-navy/10 hover:border-jw-navy/30 hover:shadow-sm'
            ].join(' ')}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold leading-none">{d.short}</span>
              {isToday && (
                <span
                  className={[
                    'text-[10px] uppercase tracking-wider font-bold rounded-full px-1.5 py-0.5',
                    isSel ? 'bg-jw-gold text-[#1f1300]' : 'bg-jw-gold/15 text-jw-gold'
                  ].join(' ')}
                >
                  Hoy
                </span>
              )}
            </span>
            <span className={['text-[11px] font-medium', isSel ? 'text-white/70' : 'text-jw-mute'].join(' ')}>
              {d.label} · {d.assignments.length} salida{d.assignments.length === 1 ? '' : 's'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
