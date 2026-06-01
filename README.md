# Territorios Map (Rosario)

App web para dibujar territorios sobre el mapa de Rosario y publicar una agenda
de salidas. Cualquiera con el enlace puede **ver**; solo un **administrador**
(con código) puede **editar**. Los datos se guardan en la nube (Supabase) y se
comparten en vivo con todos.

## Cómo publicarla (paso a paso)

### 1. Crear la base de datos (Supabase) — gratis
1. Entrá a https://supabase.com y creá una cuenta. Hacé clic en **New project**.
2. Elegí un nombre y una contraseña de base de datos. Esperá ~1 minuto.
3. En el menú izquierdo: **SQL Editor → New query**. Pegá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y hacé clic en **Run**.
4. Creá el usuario administrador: **Authentication → Users → Add user**.
   - Email: `manager@territorios.local`
   - Password: **este será el código** que usarán los administradores.
   - Dejá el usuario confirmado (Auto Confirm User = sí).
5. Anotá dos datos (Supabase cambió hace poco dónde están):
   - **Project URL** → tocá el botón **Connect** (arriba en el dashboard); ahí
     aparece `Project URL` (`https://xxxx.supabase.co`). También está en
     **Settings → Data API**.
   - **La clave pública** → **Settings → API Keys** → copiá la **Publishable key**
     (empieza con `sb_publishable_...`). Esa es la que va en `VITE_SUPABASE_ANON_KEY`.
     - La vieja clave **anon** está en la pestaña **Legacy API Keys** y todavía
       funciona, pero conviene usar la *Publishable key*.

### 2. Subir el código a GitHub
1. Creá un repositorio nuevo en https://github.com (vacío).
2. Subí esta carpeta:
   ```bash
   git init
   git add -A
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

### 3. Publicar en Vercel — gratis
1. Entrá a https://vercel.com e iniciá sesión con GitHub.
2. **Add New → Project →** importá tu repositorio.
3. En **Environment Variables** agregá tres variables (de los pasos anteriores):
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | tu Project URL |
   | `VITE_SUPABASE_ANON_KEY` | tu Publishable key (`sb_publishable_...`) |
   | `VITE_MANAGER_EMAIL` | `manager@territorios.local` |
4. Hacé clic en **Deploy**. En ~1 minuto tenés tu URL pública.

### 4. Compartir
- Pasá la **URL** a todos los que necesiten consultar.
- Pasá el **código** (la contraseña del usuario administrador) solo a quienes editan.

## Cómo usarla
- **Ver:** pestaña **Mapa**. Los territorios de hoy salen resaltados.
- **Editar:** botón **Editar** → ingresá el código.
  - **Territorios:** dibujá polígonos con la herramienta del mapa (arriba a la
    izquierda); editá nombre/color/notas en la tabla; borrá con ✕; para cambiar
    la forma, borralo y dibujalo de nuevo.
  - **Agenda:** agregá días y salidas, y asociá los números de territorio.
- **Respaldo:** **Exportar** baja una copia `.json`; **Importar** la restaura.
- Todo se guarda solo en la nube y lo ven todos al instante.

## Desarrollo local
```bash
cp .env.example .env   # completá con tus valores de Supabase
npm install
npm run dev
```

## Tests
```bash
npm test
```
