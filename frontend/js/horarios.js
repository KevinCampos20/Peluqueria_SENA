"use strict";
/* ============================================================
   Horarios: normalización de datos, consulta, formato y dibujo.
   ============================================================ */

// Hasta qué ID de trabajador se consulta cuando GET /horarios no existe.
const MAX_ID_SONDEO = 40;

/* ---------- Horas (en la BD son texto: "7:00 am", "12:00 m", "3:00 pm") ---------- */
function aMinutos(t) {
  const x = String(t ?? "").trim().toLowerCase();
  let m = x.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::\d\d)?$/); // 24 h
  if (m) return +m[1] * 60 + +m[2];
  m = x.match(/^(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm|m)$/); // 12 h
  if (!m) return null;
  if (m[3] === "m") return +m[1] === 12 && +m[2] === 0 ? 720 : null;
  let h = +m[1] % 12;
  if (m[3] === "pm") h += 12;
  return h * 60 + +m[2];
}
function aHHMM(t) {
  const n = aMinutos(t);
  if (n === null) return "";
  return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
}
function formatoHora(t) {
  const n = aMinutos(t);
  if (n === null) return String(t ?? "");
  const h = Math.floor(n / 60);
  const mm = String(n % 60).padStart(2, "0");
  if (h === 12 && mm === "00") return "12:00 m";
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "am" : "pm"}`;
}
function formatoDia(f) {
  const [y, m, d] = String(f).slice(0, 10).split("-").map(Number);
  if (!y) return String(f);
  const t = new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Reglas de la peluquería (iguales a las del backend)
function validarJornada(inicio, final) {
  if (inicio === null || final === null) return "Escribe una hora válida.";
  if (inicio >= final) return "La hora de inicio debe ser anterior a la hora final.";
  if (inicio < 7 * 60) return "La peluquería abre a las 7:00 a. m.";
  if (inicio > 20 * 60) return "La última cita puede comenzar a las 8:00 p. m.";
  if (final > 21 * 60) return "El horario debe finalizar como máximo a las 9:00 p. m.";
  if (inicio < 13 * 60 && final > 12 * 60) return "No se permiten horarios durante el almuerzo (12:00 m. a 1:00 p. m.).";
  return null;
}

/* ---------- Modelo ---------- */
const Horarios = {
  // Unifica los nombres de campo que devuelven los distintos endpoints
  normalizar(h) {
    return {
      id: Number(dato(h, "idHorario")) || null,
      idTrabajador: Number(dato(h, "idTrabajador")) || null,
      trabajador: String(dato(h, "trabajador", "nombresTrabajador", "nombres") ?? ""),
      fecha: String(dato(h, "fecha") ?? "").slice(0, 10),
      horaInicio: String(dato(h, "horaInicio") ?? "").trim(),
      horaFinal: String(dato(h, "horaFinal", "horaFin") ?? "").trim(),
      estado: String(dato(h, "estado", "estadoRegistro") ?? "Activo"),
    };
  },
  lista(datos) {
    const l = datos?.horarios ?? datos?.datos ?? (Array.isArray(datos) ? datos : []);
    return Array.isArray(l) ? l.map((h) => this.normalizar(h)) : [];
  },
  disponible: (h) => h.estado.toLowerCase() === "activo",
  inicio(h) {
    const [y, m, d] = h.fecha.split("-").map(Number);
    const min = aMinutos(h.horaInicio);
    if (!y || min === null) return null;
    return new Date(y, m - 1, d, Math.floor(min / 60), min % 60);
  },
  esPasado(h) {
    const d = this.inicio(h);
    return d ? d.getTime() <= Date.now() : false;
  },
  clave: (h) => `${h.fecha}|${aMinutos(h.horaInicio)}|${aMinutos(h.horaFinal)}`,
  orden: (a, b) =>
    a.fecha.localeCompare(b.fecha) || (aMinutos(a.horaInicio) ?? 0) - (aMinutos(b.horaInicio) ?? 0),

  // RF-07: GET /seguridad/horarios/:idtrabajador (incluye idhorario)
  async deTrabajador(id) {
    const r = await api(`/seguridad/horarios/${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error(r.error);
    return this.lista(r.datos).map((h) => ({ ...h, idTrabajador: h.idTrabajador ?? Number(id) }));
  },

  // RF-06: GET /horarios. Si esa ruta no existe en el servidor, se reúnen los
  // horarios consultando RF-07 para cada trabajador.
  async todos() {
    const r = await api("/horarios");
    if (r.ok) {
      const l = this.lista(r.datos);
      if (l.every((h) => h.id && h.idTrabajador)) return l.sort(this.orden);
    }
    if (r.status === 0) throw new Error(r.error);
    const ids = Array.from({ length: MAX_ID_SONDEO }, (_, i) => i + 1);
    const res = await Promise.allSettled(ids.map((id) => this.deTrabajador(id)));
    const ok = res.filter((p) => p.status === "fulfilled");
    if (!ok.length) throw new Error(res[0].reason?.message || "No se pudieron consultar los horarios.");
    return ok.flatMap((p) => p.value).sort(this.orden);
  },
};

/* ---------- Dibujo ---------- */
function etiquetaEstado(h, textoLibre = "disponible", textoOcupado = "reservado") {
  const libre = Horarios.disponible(h);
  return el("span", "estado " + (libre ? "disponible" : "reservado"), libre ? textoLibre : textoOcupado);
}

/* Lista agrupada por día.
   opciones: { vacio, trabajador (mostrar nombre), estado (mostrar etiqueta), acciones(h) → nodos[] } */
function pintarAgenda(cont, lista, { vacio, trabajador = false, estado = true, acciones } = {}) {
  if (!lista.length) {
    cont.replaceChildren(el("p", "vacio", vacio || "No hay horarios para mostrar."));
    return;
  }
  const grupos = {};
  [...lista].sort(Horarios.orden).forEach((h) => (grupos[h.fecha] ||= []).push(h));
  cont.replaceChildren(
    ...Object.keys(grupos)
      .sort()
      .map((f) => {
        const s = el("section", "dia", el("h2", null, formatoDia(f)));
        grupos[f].forEach((h) => {
          const hora = el("div", "hora", formatoHora(h.horaInicio), el("small", null, `hasta ${formatoHora(h.horaFinal)}`));
          const info = el("div", "info", trabajador ? `con ${h.trabajador || "—"}` : "");
          const turno = el("div", "turno", hora, info, estado ? etiquetaEstado(h) : el("span"));
          const acc = acciones ? acciones(h) : [];
          if (acc && acc.length) turno.append(el("div", "acciones-fila", acc));
          s.append(turno);
        });
        return s;
      }),
  );
}

/* Formulario para editar un horario (trabajador y admin).
   guardar({ fecha, horaInicio, horaFinal, estado? }) → resultado de api() */
function formularioHorario(h, { admin = false, guardar, alExito }) {
  const sufijo = Math.random().toString(36).slice(2, 7);
  const fecha = el("input", { type: "date", id: "f-" + sufijo, value: h.fecha, required: true });
  const ini = el("input", { type: "time", id: "i-" + sufijo, value: aHHMM(h.horaInicio), required: true });
  const fin = el("input", { type: "time", id: "e-" + sufijo, value: aHHMM(h.horaFinal), required: true });
  const estado = admin
    ? el(
        "select",
        { id: "s-" + sufijo },
        el("option", { value: "Activo", selected: Horarios.disponible(h) }, "Activo (disponible)"),
        el("option", { value: "Inactivo", selected: !Horarios.disponible(h) }, "Inactivo (no disponible)"),
      )
    : null;
  const aviso = el("p", { class: "aviso", role: "alert" });
  const ok = el("button", { type: "submit", class: "btn" }, "Guardar cambios");
  const no = el("button", { type: "button", class: "btn sec" }, "Cancelar");
  const campo = (id, t, c) => el("div", "campo", el("label", { for: id }, t), c);
  const form = el(
    "form",
    { class: "modal-cuerpo", novalidate: true },
    campo(fecha.id, "Fecha", fecha),
    el("div", "fila-2", campo(ini.id, "Hora de inicio", ini), campo(fin.id, "Hora final", fin)),
    estado ? campo(estado.id, "Estado del horario", estado) : null,
    el("p", "ayuda", "Jornada: 7:00 a. m. a 9:00 p. m. (última cita a las 8:00 p. m.), sin horarios de 12:00 m. a 1:00 p. m."),
    aviso,
    el("div", "acciones", no, ok),
  );
  const dlg = modal("Editar horario", form);
  no.addEventListener("click", () => dlg.close());
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    aviso.className = "aviso error";
    if (!fecha.value) return void (aviso.textContent = "Selecciona una fecha.");
    const msg = validarJornada(aMinutos(ini.value), aMinutos(fin.value));
    if (msg) return void (aviso.textContent = msg);
    aviso.textContent = "";
    await conCarga(ok, async () => {
      const cambios = { fecha: fecha.value, horaInicio: ini.value, horaFinal: fin.value };
      if (estado) cambios.estado = estado.value;
      const r = await guardar(cambios);
      if (!r.ok) {
        aviso.textContent = r.error;
        return;
      }
      dlg.close();
      toast(r.datos.mensaje || "Horario actualizado correctamente.");
      if (alExito) alExito(r);
    });
  });
  fecha.focus();
}
