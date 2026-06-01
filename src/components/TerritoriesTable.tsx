import { useAppData } from '../store/AppDataContext';

export function TerritoriesTable() {
  const { data, dispatch } = useAppData();
  return (
    <div className="overflow-y-auto h-full p-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-jw-mute border-b">
            <th className="py-2 w-12">#</th>
            <th className="py-2">Nombre</th>
            <th className="py-2 w-16">Color</th>
            <th className="py-2">Notas</th>
            <th className="py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {data.territories.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-1 font-semibold text-jw-navy">{t.id}</td>
              <td className="py-1">
                <input
                  className="w-full rounded border border-jw-navy/15 px-2 py-1"
                  value={t.name}
                  onChange={(e) => dispatch({ type: 'territory/update', id: t.id, patch: { name: e.target.value } })}
                />
              </td>
              <td className="py-1">
                <input
                  type="color"
                  value={t.color}
                  onChange={(e) => dispatch({ type: 'territory/update', id: t.id, patch: { color: e.target.value } })}
                />
              </td>
              <td className="py-1">
                <input
                  className="w-full rounded border border-jw-navy/15 px-2 py-1"
                  value={t.notes}
                  onChange={(e) => dispatch({ type: 'territory/update', id: t.id, patch: { notes: e.target.value } })}
                />
              </td>
              <td className="py-1">
                <button
                  aria-label={`Eliminar territorio ${t.id}`}
                  onClick={() => dispatch({ type: 'territory/remove', id: t.id })}
                  className="text-red-600 hover:text-red-800"
                >✕</button>
              </td>
            </tr>
          ))}
          {data.territories.length === 0 && (
            <tr><td colSpan={5} className="py-6 text-center text-jw-mute">Dibujá un territorio en el mapa para empezar.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
