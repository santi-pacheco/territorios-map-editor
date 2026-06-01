import { useState } from 'react';

export function LoginModal({ onSubmit, onClose }: { onSubmit: (code: string) => Promise<void>; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await onSubmit(code);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-3"
      >
        <h2 className="text-lg font-bold text-jw-navy">Modo administrador</h2>
        <p className="text-sm text-jw-mute">Ingresá el código para editar territorios y agenda.</p>
        <input
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código"
          className="w-full rounded-xl border border-jw-navy/20 px-3 py-2 text-sm"
        />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-jw-mute">Cancelar</button>
          <button type="submit" disabled={busy} className="rounded-xl bg-jw-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? 'Verificando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
