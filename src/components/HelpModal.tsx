export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-jw-navy">Cómo usar la aplicación</h2>
        <section className="text-sm text-jw-ink space-y-2">
          <p><strong>Ver (todos):</strong> la pestaña <em>Mapa</em> tiene un panel con los días. Elegí un día para ver sus salidas (hora, esquina, grupo, responsable); tocá una salida y el mapa se acerca a sus territorios. El día de hoy aparece marcado.</p>
          <p><strong>Editar (administrador):</strong> tocá <em>Editar</em> e ingresá el código.</p>
          <p><strong>Dibujar un territorio:</strong> en la pestaña <em>Territorios</em>, usá la herramienta de polígono (arriba a la izquierda del mapa), hacé clic para marcar las esquinas y doble clic para cerrar. Aparece en la tabla.</p>
          <p><strong>Editar nombre/color/notas:</strong> en la tabla de la derecha. Para borrar uno, usá la ✕.</p>
          <p><strong>Para cambiar la forma:</strong> borrá el territorio y dibujalo de nuevo.</p>
          <p><strong>Agenda:</strong> en la pestaña <em>Agenda</em> agregá días y salidas (hora, esquina, grupo, responsable) y asociá los números de territorio. Elegí el <em>día de la semana</em> de cada día para que se marque solo cuando llega esa fecha.</p>
          <p><strong>Guardado:</strong> los cambios se guardan solos en la nube y los ven todos al instante.</p>
          <p><strong>Respaldo:</strong> usá <em>Exportar</em> para bajar una copia, <em>Importar</em> para restaurarla.</p>
        </section>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-jw-navy px-4 py-2 text-sm font-semibold text-white">Entendido</button>
        </div>
      </div>
    </div>
  );
}
