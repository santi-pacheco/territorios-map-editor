import { useRef } from 'react';
import { useAppData } from '../store/AppDataContext';
import { downloadJson } from '../lib/download';
import { parseAppData } from '../lib/validate';
import { demoData } from '../data/demo';
import { emptyAppData } from '../types';

export function Toolbar() {
  const { data, dispatch } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = parseAppData(await file.text());
      dispatch({ type: 'replace', data: parsed });
    } catch (err) {
      alert(`Archivo inválido: ${err instanceof Error ? err.message : 'error'}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 bg-jw-sand/60 px-4 py-2 text-sm border-b border-jw-navy/10">
      <button onClick={() => downloadJson('territorios.json', data)} className="rounded-lg bg-white px-3 py-1.5 font-semibold text-jw-navy border border-jw-navy/15">Exportar</button>
      <button onClick={() => fileRef.current?.click()} className="rounded-lg bg-white px-3 py-1.5 font-semibold text-jw-navy border border-jw-navy/15">Importar</button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
      <span className="mx-1 h-4 w-px bg-jw-navy/15" />
      <button onClick={() => dispatch({ type: 'replace', data: demoData() })} className="rounded-lg bg-white px-3 py-1.5 text-jw-navy border border-jw-navy/15">Cargar datos de ejemplo</button>
      <button
        onClick={() => { if (confirm('¿Borrar todos los territorios y la agenda?')) dispatch({ type: 'replace', data: emptyAppData() }); }}
        className="rounded-lg bg-white px-3 py-1.5 text-red-600 border border-red-200"
      >Borrar todo</button>
    </div>
  );
}
