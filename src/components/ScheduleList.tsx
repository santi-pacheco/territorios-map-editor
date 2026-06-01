import type { Assignment, Territory } from '../types';
import { TerritoryBadge } from './TerritoryBadge';

interface Props {
  assignments: Assignment[];
  territories: Territory[];
  selectedUid: string | null;
  onHover: (territoryIds: number[]) => void;
  onSelect: (a: Assignment | null) => void;
}

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

export function ScheduleList({ assignments, territories, selectedUid, onHover, onSelect }: Props) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-jw-navy/15 bg-white/60 px-5 py-8 text-center text-sm text-jw-mute">
        Sin salidas asignadas para este día.
      </div>
    );
  }
  const territorySet = new Set(territories.map((t) => t.id));

  return (
    <ul className="flex flex-col gap-2.5">
      {assignments.map((a) => {
        const isSel = a.uid === selectedUid;
        const ids = a.territoryIds.length > 0 ? a.territoryIds : [null];
        return (
          <li
            key={a.uid}
            onMouseEnter={() => onHover(a.territoryIds)}
            onMouseLeave={() => onHover([])}
            onClick={() => onSelect(isSel ? null : a)}
            className={[
              'group fade-in cursor-pointer rounded-2xl p-3.5 transition-all duration-200',
              isSel
                ? 'border-2 border-jw-gold bg-gradient-to-br from-jw-gold/10 to-white shadow-[0_12px_32px_rgba(180,130,30,0.25)]'
                : 'border border-jw-navy/10 bg-white hover:border-jw-gold/60 hover:shadow-[0_10px_28px_rgba(31,58,104,0.12)]'
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1.5">
                {ids.map((id, i) => {
                  const known = id != null && territorySet.has(id);
                  return <TerritoryBadge key={`${id ?? 'n'}-${i}`} id={id} highlighted={known || isSel} />;
                })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-jw-navy font-semibold text-[13px]">
                  <ClockIcon />
                  <span>{a.time}</span>
                  {a.groups && (
                    <span className="ml-auto rounded-full bg-jw-sand text-jw-navy text-[10px] font-bold tracking-wider uppercase px-2 py-0.5">
                      {/^\d/.test(a.groups) ? `Grupo ${a.groups}` : a.groups}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-jw-ink">
                  <PinIcon />
                  <span className="truncate font-medium">{a.corner}</span>
                </div>
                {a.leader && (
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-jw-mute">
                    <PersonIcon />
                    <span className="truncate">{a.leader}</span>
                  </div>
                )}
                {isSel && (
                  <div className="mt-2.5 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-jw-gold">
                    <span>● Marcado en el mapa</span>
                    <span className="text-jw-mute normal-case font-medium tracking-normal">click para deseleccionar</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
