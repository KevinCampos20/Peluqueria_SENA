"use strict";
/* Panel de administración.
   Horarios: RF-06/07 (consultar), RF-11 (editar), RF-12 (eliminar).
   Usuarios: crear (RF-01, 04, 16), activar/desactivar (RF-18…21, 23, 24), eliminar (RF-13, 14, 25). */

document.addEventListener("DOMContentLoaded", () => {
  const u = iniciarPanel("admin", "Administración");
  if (!u) return;
  const miId = Sesion.id(u);

  /* La API no tiene endpoints para listar usuarios. Para no depender de memorizar IDs,
     se recuerdan en este navegador los usuarios creados o descubiertos por sus horarios. */
  const Registro = {
    clave: "registroUsuariosPeluqueria",
    leer() {
      try {
        const d = JSON.parse(localStorage.getItem(this.clave)) || {};
        return { trabajador: d.trabajador || [], cliente: d.cliente || [], admin: d.admin || [] };
      } catch {
        return { trabajador: [], cliente: [], admin: [] };
      }
    },
    guardar(d) {
      try {
        localStorage.setItem(this.clave, JSON.stringify(d));
      } catch {}
    },
    lista(tipo) {
      return this.leer()[tipo].sort((a, b) => a.id - b.id);
    },
    poner(tipo, reg) {
      const d = this.leer();
      const i = d[tipo].findIndex((x) => x.id === reg.id);
      if (i >= 0) d[tipo][i] = { ...d[tipo][i], ...reg };
      else d[tipo].push(reg);
      this.guardar(d);
    },
    quitar(tipo, id) {
      const d = this.leer();
      d[tipo] = d[tipo].filter((x) => x.id !== id);
      this.guardar(d);
    },
  };
  Registro.poner("admin", { id: miId, nombre: u.nombres, correo: u.correo, estado: "Activo" });

  const TIPOS = {
    trabajador: {
      titulo: "Trabajadores",
      singular: "trabajador",
      crear: "/seguridad/creartrabajador",
      activar: (id) => `/seguridad/activartrabajador/${id}`,
      desactivar: (id) => `/seguridad/desactivartrabajador/${id}`,
      eliminar: (id) => `/seguridad/trabajadores/${id}`,
    },
    cliente: {
      titulo: "Clientes",
      singular: "cliente",
      crear: "/seguridad/crearcliente",
      activar: (id) => `/seguridad/activarcliente/${id}`,
      desactivar: (id) => `/seguridad/desactivarcliente/${id}`,
      eliminar: (id) => `/seguridad/clientes/${id}`,
    },
    admin: {
      titulo: "Administradores",
      singular: "administrador",
      crear: "/seguridad/crearadmin",
      activar: (id) => `/seguridad/activaradmin/${id}`,
      desactivar: (id) => `/seguridad/desactivaradmin/${id}`,
      eliminar: (id) => `/seguridad/admins/${id}`,
    },
  };
  const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  /* ================= Horarios ================= */
  function pintarHorarios(cont) {
    let todos = [];
    const conocidos = new Map(); // idTrabajador → nombre
    Registro.lista("trabajador").forEach((t) => conocidos.set(t.id, t.nombre));

    const selTrab = el("select", { id: "fTrab" });
    const fFecha = el("input", { type: "date", id: "fFecha" });
    const fEstado = el(
      "select",
      { id: "fEstado" },
      el("option", { value: "" }, "Todos"),
      el("option", { value: "activo" }, "Disponibles"),
      el("option", { value: "inactivo" }, "No disponibles"),
    );
    const btnAct = el("button", { type: "button", class: "btn sec" }, "Actualizar");
    const resumen = el("p", { class: "resumen", "aria-live": "polite" });
    const lista = el("div", { id: "listaHorarios" });
    cont.append(
      el(
        "div",
        "herramientas",
        el("div", "campo", el("label", { for: "fTrab" }, "Trabajador"), selTrab),
        el("div", "campo", el("label", { for: "fFecha" }, "Fecha"), fFecha),
        el("div", "campo", el("label", { for: "fEstado" }, "Estado"), fEstado),
        btnAct,
      ),
      resumen,
      lista,
    );

    function llenarSelect(seleccionado) {
      selTrab.replaceChildren(
        el("option", { value: "" }, "Todos los trabajadores"),
        ...[...conocidos].sort((a, b) => a[0] - b[0]).map(([id, n]) => el("option", { value: id }, `${n || "Trabajador"} (ID ${id})`)),
      );
      selTrab.value = conocidos.has(Number(seleccionado)) ? String(seleccionado) : "";
    }

    let version = 0;
    async function cargar() {
      const miVersion = ++version;
      resumen.textContent = "";
      lista.replaceChildren(el("p", "vacio", "Cargando horarios…"));
      const sel = selTrab.value;
      try {
        // RF-07 si hay un trabajador elegido; si no, todos (RF-06 con respaldo por RF-07)
        todos = sel ? await Horarios.deTrabajador(sel) : await Horarios.todos();
      } catch (e) {
        if (miVersion !== version) return;
        const b = el("button", { type: "button", class: "btn sec" }, "Reintentar");
        b.addEventListener("click", cargar);
        lista.replaceChildren(el("div", "fallo", `No se pudieron cargar los horarios. ${e.message}`, el("br"), b));
        return;
      }
      if (miVersion !== version) return;
      const admins = new Set(Registro.lista("admin").map((a) => a.id));
      todos.forEach((h) => {
        if (!h.idTrabajador) return;
        conocidos.set(h.idTrabajador, h.trabajador || conocidos.get(h.idTrabajador));
        if (!admins.has(h.idTrabajador)) Registro.poner("trabajador", { id: h.idTrabajador, nombre: h.trabajador });
      });
      llenarSelect(sel);
      pintar();
    }

    function pintar() {
      let l = todos;
      if (fFecha.value) l = l.filter((h) => h.fecha === fFecha.value);
      if (fEstado.value) l = l.filter((h) => h.estado.toLowerCase() === fEstado.value);
      const libres = l.filter(Horarios.disponible).length;
      resumen.textContent = l.length
        ? `${l.length} ${l.length === 1 ? "horario" : "horarios"}: ${libres} ${libres === 1 ? "disponible" : "disponibles"} y ${l.length - libres} ${l.length - libres === 1 ? "no disponible" : "no disponibles"}.`
        : "";
      pintarAgenda(lista, l, {
        vacio: todos.length ? "No hay horarios con ese filtro." : "Aún no hay horarios registrados.",
        trabajador: true,
        acciones: (h) => {
          const ed = el("button", { type: "button", class: "btn sec pequeno" }, "Editar");
          const bo = el("button", { type: "button", class: "btn peligro pequeno" }, "Eliminar");
          ed.addEventListener("click", () =>
            formularioHorario(h, {
              admin: true,
              guardar: (c) => api(`/seguridad/horarios/${h.id}`, { method: "PUT", body: c }),
              alExito: cargar,
            }),
          );
          bo.addEventListener("click", async () => {
            const ok = await confirmar(
              "Eliminar horario",
              `¿Eliminar el horario de ${h.trabajador || "este trabajador"} del ${formatoDia(h.fecha)}, ${formatoHora(h.horaInicio)} a ${formatoHora(h.horaFinal)}?`,
              { boton: "Eliminar", peligro: true },
            );
            if (!ok) return;
            await conCarga(bo, async () => {
              const r = await api(`/seguridad/horarios/${h.id}`, { method: "DELETE" });
              if (!r.ok) return toast(r.error, "error");
              toast(r.datos.mensaje || "Horario eliminado correctamente.");
              cargar();
            });
          });
          return [ed, bo];
        },
      });
    }

    selTrab.addEventListener("change", cargar);
    [fFecha, fEstado].forEach((c) => c.addEventListener("change", pintar));
    btnAct.addEventListener("click", cargar);
    llenarSelect("");
    cargar();
  }

  /* ================= Trabajadores, clientes y administradores ================= */
  function pintarUsuarios(tipo) {
    return (cont) => {
      const cfg = TIPOS[tipo];
      const tabla = el("div", "tabla-caja");

      async function accion(id, que, boton) {
        if (!Number.isInteger(id) || id < 1) return toast("Escribe un ID válido (número entero positivo).", "error");
        if (tipo === "admin" && id === miId && que !== "activar")
          return toast(`No puedes ${que === "eliminar" ? "eliminar" : "desactivar"} tu propia cuenta.`, "error");
        if (que === "eliminar") {
          const ok = await confirmar(
            `Eliminar ${cfg.singular}`,
            `¿Eliminar definitivamente al ${cfg.singular} con ID ${id}? Esta acción no se puede deshacer.`,
            { boton: "Eliminar", peligro: true },
          );
          if (!ok) return;
        }
        await conCarga(boton, async () => {
          const r = await api(cfg[que](id), { method: que === "eliminar" ? "DELETE" : "PUT" });
          if (!r.ok) return toast(r.error, "error");
          toast(r.datos.mensaje || "Operación realizada correctamente.");
          if (que === "eliminar") Registro.quitar(tipo, id);
          else Registro.poner(tipo, { id, estado: que === "activar" ? "Activo" : "Inactivo" });
          dibujar();
        });
      }

      /* Crear */
      const formCrear = formularioUsuario({
        boton: `Crear ${cfg.singular}`,
        enviar: (body) => api(cfg.crear, { method: "POST", body }),
        alExito: (r, body) => {
          Registro.poner(tipo, { id: r.datos.id, nombre: body.t3, correo: body.t6, estado: "Activo" });
          toast(`${mayus(cfg.singular)} creado con el ID ${r.datos.id}.`);
          dibujar();
        },
      });

      /* Gestionar por ID */
      const entradaId = el("input", { type: "number", min: "1", id: "idGestion-" + tipo, inputmode: "numeric", placeholder: "Ej. 3" });
      const botones = [
        ["activar", "Activar", "btn sec"],
        ["desactivar", "Desactivar", "btn sec"],
        ["eliminar", "Eliminar", "btn peligro"],
      ].map(([que, texto, clase]) => {
        const b = el("button", { type: "button", class: clase }, texto);
        b.addEventListener("click", () => accion(Number(entradaId.value), que, b));
        return b;
      });

      cont.append(
        el(
          "div",
          "rejilla-2",
          el("section", "tarjeta", el("h2", null, `Crear ${cfg.singular}`), formCrear),
          el(
            "section",
            "tarjeta",
            el("h2", null, "Gestionar por ID"),
            el("p", "ayuda", `Activa, desactiva o elimina un ${cfg.singular} escribiendo su número de ID.`),
            el("div", "campo", el("label", { for: entradaId.id }, `ID del ${cfg.singular}`), entradaId),
            el("div", "acciones-fila", botones),
          ),
        ),
        el("section", "tarjeta", el("h2", null, `${cfg.titulo} conocidos`), tabla),
      );

      function dibujar() {
        const regs = Registro.lista(tipo);
        if (!regs.length) {
          tabla.replaceChildren(
            el("p", "vacio", `Aún no hay ${cfg.titulo.toLowerCase()} registrados en este navegador. Crea uno o gestiona por ID.`),
          );
          return;
        }
        const filas = regs.map((r) => {
          const acc = el("div", "acciones-fila");
          [
            ["activar", "Activar", "btn sec pequeno", r.estado !== "Activo"],
            ["desactivar", "Desactivar", "btn sec pequeno", r.estado !== "Inactivo"],
            ["eliminar", "Eliminar", "btn peligro pequeno", true],
          ].forEach(([que, texto, clase, mostrar]) => {
            if (!mostrar) return;
            const b = el("button", { type: "button", class: clase }, texto);
            b.addEventListener("click", () => accion(r.id, que, b));
            acc.append(b);
          });
          const est = r.estado
            ? el("span", "estado " + (r.estado === "Activo" ? "disponible" : "cancelado"), r.estado)
            : el("span", "estado", "sin consultar");
          return el(
            "tr",
            null,
            el("td", null, String(r.id)),
            el("td", null, (r.nombre || "—") + (tipo === "admin" && r.id === miId ? " (tú)" : "")),
            el("td", null, r.correo || "—"),
            el("td", null, est),
            el("td", null, acc),
          );
        });
        tabla.replaceChildren(
          el(
            "table",
            "tabla",
            el("thead", null, el("tr", null, ["ID", "Nombre", "Correo", "Estado", "Acciones"].map((t) => el("th", { scope: "col" }, t)))),
            el("tbody", null, filas),
          ),
        );
      }
      dibujar();
    };
  }

  pestanas(
    document.getElementById("pestanas"),
    document.getElementById("contenido"),
    [
      { id: "horarios", titulo: "Horarios", render: pintarHorarios },
      { id: "trabajadores", titulo: "Trabajadores", render: pintarUsuarios("trabajador") },
      { id: "clientes", titulo: "Clientes", render: pintarUsuarios("cliente") },
      { id: "admins", titulo: "Administradores", render: pintarUsuarios("admin") },
    ],
    location.hash.slice(1),
  );
});
