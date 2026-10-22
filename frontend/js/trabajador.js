"use strict";
/* Panel del trabajador: ver su agenda (RF-08.1, 08.2, 08.3),
   editar (RF-09) y eliminar (RF-10) sus horarios. */

document.addEventListener("DOMContentLoaded", () => {
  const u = iniciarPanel("trabajador", "Equipo");
  if (!u) return;
  const idTrabajador = Sesion.id(u);
  const cont = document.getElementById("contenido");

  const fFecha = el("input", { type: "date", id: "fFecha" });
  const fEstado = el(
    "select",
    { id: "fEstado" },
    el("option", { value: "" }, "Todos"),
    el("option", { value: "A" }, "Disponibles"),
    el("option", { value: "I" }, "No disponibles"),
  );
  const btnFiltrar = el("button", { type: "submit", class: "btn" }, "Filtrar");
  const btnTodos = el("button", { type: "button", class: "btn sec" }, "Ver todos");
  const resumen = el("p", { class: "resumen", "aria-live": "polite" });
  const lista = el("div", { id: "listaHorarios" });

  const barra = el(
    "form",
    { class: "herramientas", novalidate: true },
    el("div", "campo", el("label", { for: "fFecha" }, "Fecha"), fFecha),
    el("div", "campo", el("label", { for: "fEstado" }, "Estado"), fEstado),
    btnFiltrar,
    btnTodos,
  );
  cont.append(barra, resumen, lista);

  let version = 0; // descarta respuestas viejas si se filtra varias veces seguidas

  async function cargar() {
    const miVersion = ++version;
    resumen.textContent = "";
    lista.replaceChildren(el("p", "vacio", "Cargando horarios…"));
    const fecha = fFecha.value;
    const est = fEstado.value;

    // RF-07: sirve para conocer el idhorario de cada fila (los endpoints RF-08 no lo traen)
    const idsPromesa = Horarios.deTrabajador(idTrabajador).catch(() => []);

    // RF-08.2 (por fecha) o RF-08.1 (todos)
    const r = fecha
      ? await api(`/trabajador/horariod/${idTrabajador}&${encodeURIComponent(fecha)}`)
      : await api(`/trabajador/horariot/${idTrabajador}`);
    if (miVersion !== version) return;
    if (!r.ok) {
      const b = el("button", { type: "button", class: "btn sec" }, "Reintentar");
      b.addEventListener("click", cargar);
      lista.replaceChildren(el("div", "fallo", `No se pudieron cargar los horarios. ${r.error}`, el("br"), b));
      return;
    }
    let filas = Horarios.lista(r.datos);

    // RF-08.3 (fecha + estado). Si el servidor no devuelve datos, se filtra en pantalla.
    if (fecha && est) {
      const r3 = await api(`/trabajador/horarioe/${idTrabajador}&${encodeURIComponent(fecha)}&${est}`);
      const l3 = r3.ok ? Horarios.lista(r3.datos) : [];
      if (l3.length) filas = l3;
    }
    if (est) filas = filas.filter((h) => (est === "A" ? Horarios.disponible(h) : !Horarios.disponible(h)));

    const conIds = new Map((await idsPromesa).map((h) => [Horarios.clave(h), h]));
    if (miVersion !== version) return;
    filas = filas.map((h) => ({ ...h, idTrabajador, id: conIds.get(Horarios.clave(h))?.id ?? null }));

    const libres = filas.filter(Horarios.disponible).length;
    const noDisponibles = filas.length - libres;
    resumen.textContent = filas.length
      ? `${filas.length} ${filas.length === 1 ? "horario" : "horarios"}: ${libres} ${libres === 1 ? "disponible" : "disponibles"} y ${noDisponibles} ${noDisponibles === 1 ? "no disponible" : "no disponibles"}.`
      : "";

    pintarAgenda(lista, filas, {
      vacio: fecha || est ? "No hay horarios con ese filtro." : "Todavía no tienes horarios asignados.",
      trabajador: false,
      acciones: (h) => {
        const ed = el("button", { type: "button", class: "btn sec pequeno" }, "Editar");
        const el2 = el("button", { type: "button", class: "btn peligro pequeno" }, "Eliminar");
        if (!h.id) {
          [ed, el2].forEach((b) => {
            b.disabled = true;
            b.title = "No se pudo identificar este horario. Pulsa «Ver todos» para recargar.";
          });
        }
        ed.addEventListener("click", () => editar(h));
        el2.addEventListener("click", () => eliminar(h, el2));
        return [ed, el2];
      },
    });
  }

  function editar(h) {
    formularioHorario(h, {
      guardar: (c) =>
        api(`/trabajador/horarios/${h.id}`, { method: "PUT", body: { idtrabajador: idTrabajador, ...c } }),
      alExito: cargar,
    });
  }

  async function eliminar(h, boton) {
    const ok = await confirmar(
      "Eliminar horario",
      `¿Eliminar el horario del ${formatoDia(h.fecha)}, de ${formatoHora(h.horaInicio)} a ${formatoHora(h.horaFinal)}?`,
      { boton: "Eliminar", peligro: true },
    );
    if (!ok) return;
    await conCarga(boton, async () => {
      const r = await api(`/trabajador/horarios/${h.id}?idtrabajador=${idTrabajador}`, { method: "DELETE" });
      if (!r.ok) return toast(r.error, "error");
      toast(r.datos.mensaje || "Horario eliminado correctamente.");
      cargar();
    });
  }

  barra.addEventListener("submit", (e) => {
    e.preventDefault();
    cargar();
  });
  btnTodos.addEventListener("click", () => {
    fFecha.value = "";
    fEstado.value = "";
    cargar();
  });
  cargar();
});
