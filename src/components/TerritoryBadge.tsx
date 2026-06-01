interface Props {
  id: number | null;
  highlighted?: boolean;
  size?: 'sm' | 'md';
}

export function TerritoryBadge({ id, highlighted = false, size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-sm';
  if (id == null) {
    return (
      <span className={`grid place-items-center rounded-full border border-dashed border-jw-mute/40 text-jw-mute font-semibold ${dim}`}>
        —
      </span>
    );
  }
  const cls = highlighted
    ? 'bg-jw-gold text-[#1f1300] shadow-[0_4px_12px_rgba(180,130,30,0.35)]'
    : 'bg-jw-navy text-white';
  return (
    <span className={`grid place-items-center rounded-full font-bold tracking-tight ${cls} ${dim}`}>
      {id}
    </span>
  );
}
