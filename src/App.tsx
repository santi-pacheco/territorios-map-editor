import { useMemo, useState } from 'react';
import { MapView } from './components/MapView';
import { MapEditor } from './components/MapEditor';
import { TerritoriesTable } from './components/TerritoriesTable';
import { ScheduleEditor } from './components/ScheduleEditor';
import { LoginModal } from './components/LoginModal';
import { HelpModal } from './components/HelpModal';
import { Toolbar } from './components/Toolbar';
import { useAppData } from './store/AppDataContext';
import { useManager } from './store/useManager';
import { todayDow } from './lib/days';

type Tab = 'mapa' | 'territorios' | 'agenda';

export default function App() {
  const { data, loading, error } = useAppData();
  const { isManager, login, logout } = useManager();
  const [tab, setTab] = useState<Tab>('mapa');
  const [showLogin, setShowLogin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Highlight territories assigned today (viewer Mapa view).
  const highlightedIds = useMemo(() => {
    const dow = todayDow();
    const day = data.schedule.days.find((d) => d.dow === dow);
    const s = new Set<number>();
    day?.assignments.forEach((a) => a.territoryIds.forEach((id) => s.add(id)));
    return s;
  }, [data]);

  const tabs: { key: Tab; label: string; managerOnly: boolean }[] = [
    { key: 'mapa', label: 'Mapa', managerOnly: false },
    { key: 'territorios', label: 'Territorios', managerOnly: true },
    { key: 'agenda', label: 'Agenda', managerOnly: true }
  ];
  const visibleTabs = tabs.filter((t) => !t.managerOnly || isManager);

  return (
    <div className="flex h-full flex-col bg-jw-ivory">
      <header className="bg-jw-navy text-white px-4 py-3 flex items-center gap-4 z-[500]">
        <div className="font-bold tracking-wide">Territorios · Rosario</div>
        <nav className="flex gap-1">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t.key ? 'bg-white text-jw-navy' : 'text-white/80 hover:bg-white/10'}`}
            >{t.label}</button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowHelp(true)} className="text-sm text-white/80 hover:text-white">Ayuda</button>
          {isManager ? (
            <button onClick={() => { logout(); setTab('mapa'); }} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm">Salir</button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="rounded-lg bg-jw-gold px-3 py-1.5 text-sm font-semibold text-[#1f1300]">Editar</button>
          )}
        </div>
      </header>

      {isManager && <Toolbar />}

      <main className="flex-1 min-h-0">
        {loading ? (
          <div className="grid h-full place-items-center text-jw-mute">Cargando…</div>
        ) : error ? (
          <div className="grid h-full place-items-center text-red-600 p-4 text-center">Error: {error}</div>
        ) : tab === 'mapa' ? (
          <MapView territories={data.territories} highlightedIds={highlightedIds} />
        ) : tab === 'territorios' ? (
          <div className="grid h-full lg:grid-cols-[1fr_380px] min-h-0">
            <div className="min-h-0"><MapEditor highlightedIds={highlightedIds} /></div>
            <aside className="min-h-0 border-l border-jw-navy/10 bg-white"><TerritoriesTable /></aside>
          </div>
        ) : (
          <ScheduleEditor />
        )}
      </main>

      {showLogin && <LoginModal onSubmit={login} onClose={() => setShowLogin(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
