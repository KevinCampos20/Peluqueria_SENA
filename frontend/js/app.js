// Utilidades compartidas: API, sesión y guardas de rol
const API = 'http://localhost:5020'; // Único lugar donde se define la URL del backend
const CLAVE = 'usuarioPeluqueria';

const Sesion = {
  usuario() { try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; } },
  guardar(u) { localStorage.setItem(CLAVE, JSON.stringify(u)); },
  salir() { localStorage.removeItem(CLAVE); },
  // Los clientes no traen "rol" desde la API
  rol(u) { return u.rol === 'admin' || u.rol === 'trabajador' ? u.rol : 'cliente'; }
};

async function api(ruta, opciones = {}) {
  const r = await fetch(API + ruta, {
    headers: { 'Content-Type': 'application/json' }, ...opciones,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined
  });
  const datos = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, datos };
}
