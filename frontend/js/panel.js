// Panel común a los tres roles; cada uno cambia solo qué endpoint consulta
const ROLES = {
  admin: { etiqueta: 'Administración', titulo: 'Todos los horarios', sub: 'Horarios registrados de todo el equipo.',
    url: () => '/seguridad/horarios', vacio: 'Aún no hay horarios registrados.', mostrarTrabajador: true },
  trabajador: { etiqueta: 'Equipo', titulo: 'Tu agenda', sub: 'Tus turnos y si ya fueron reservados.',
    url: u => `/trabajador/horarios/${u.idtrabajador}`, vacio: 'Todavía no tienes horarios asignados.', mostrarTrabajador: false },
  cliente: { etiqueta: 'Cliente', titulo: 'Horarios disponibles', sub: 'Turnos libres para tu próxima cita.',
    url: () => '/horarios', vacio: 'No hay horarios disponibles por ahora. Vuelve a revisar más tarde.', mostrarTrabajador: true }
};

function el(tag, clase, texto) { const n = document.createElement(tag); if (clase) n.className = clase; if (texto != null) n.textContent = texto; return n; }
const hhmm = t => String(t).slice(0, 5);
const dia = f => { const [y, m, d] = String(f).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }); };

document.addEventListener('DOMContentLoaded', () => {
  const rol = document.body.dataset.rol, conf = ROLES[rol], u = Sesion.usuario();
  if (!u) { location.replace('../index.html'); return; }
  if (Sesion.rol(u) !== rol) { location.replace(`${Sesion.rol(u)}.html`); return; } // Guarda de rol (solo UX; la seguridad real va en el backend)

  document.getElementById('nombre').textContent = u.nombres;
  document.getElementById('rol').textContent = conf.etiqueta;
  document.getElementById('titulo').textContent = conf.titulo;
  document.getElementById('sub').textContent = conf.sub;
  document.getElementById('btnCerrarSesion').addEventListener('click', () => { Sesion.salir(); location.replace('../index.html'); });

  const cont = document.getElementById('contenido');
  async function cargar() {
    cont.replaceChildren(el('p', 'vacio', 'Cargando horarios…'));
    try {
      const r = await api(conf.url(u));
      if (!r.ok) throw new Error(r.datos.error || 'Error del servidor');
      pintar(Array.isArray(r.datos.horarios) ? r.datos.horarios : []);
    } catch (err) {
      const caja = el('div', 'fallo', `No se pudieron cargar los horarios. ${err.message}`);
      const b = el('button', 'btn sec', 'Reintentar'); b.addEventListener('click', cargar);
      caja.append(el('br'), b); cont.replaceChildren(caja);
    }
  }
  function pintar(lista) {
    if (!lista.length) { cont.replaceChildren(el('p', 'vacio', conf.vacio)); return; }
    const grupos = {};
    lista.forEach(h => (grupos[String(h.fecha).slice(0, 10)] ||= []).push(h));
    cont.replaceChildren(...Object.keys(grupos).sort().map(f => {
      const s = el('section', 'dia'); s.append(el('h2', null, dia(f)));
      grupos[f].sort((a, b) => hhmm(a.horaInicio).localeCompare(hhmm(b.horaInicio))).forEach(h => {
        const t = el('div', 'turno'), hora = el('div', 'hora', hhmm(h.horaInicio));
        hora.append(el('small', null, `hasta ${hhmm(h.horaFin)}`));
        t.append(hora, el('div', null, conf.mostrarTrabajador ? `con ${h.trabajador}` : ''));
        if (rol !== 'cliente') t.append(el('span', 'estado ' + String(h.estado).toLowerCase(), String(h.estado).toLowerCase()));
        s.append(t);
      }); return s;
    }));
  }
  cargar();
});
