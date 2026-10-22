"use strict";
/* Panel del cliente: ver horarios libres (RF-06), reservar (RF-26),
   cancelar (RF-15.1), reprogramar (RF-15.2) y desactivar cuenta (RF-22). */

document.addEventListener("DOMContentLoaded", () => {
  const u = iniciarPanel("cliente", "Cliente");
  if (!u) return;
  const idCliente = Sesion.id(u);
  document.getElementById("titulo").textContent = `Hola, ${String(u.nombres || "").split(" ")[0] || "bienvenido"}`;

  /* La API no tiene un endpoint para listar citas de un cliente:
     las citas creadas aquí se recuerdan en este navegador. */
  const Citas = {
    clave: `citasPeluqueria_${idCliente}`,
    leer() {
      try {
        return JSON.parse(localStorage.getItem(this.clave)) || [];
      } catch {
        return [];
      }
    },
    guardar(l) {
      try {
        localStorage.setItem(this.clave, JSON.stringify(l));
      } catch {}
    },
    agregar(c) {
      this.guardar([...this.leer().filter((x) => x.idCita !== c.idCita), c]);
    },
    cambiar(idCita, cambios) {
      this.guardar(this.leer().map((x) => (x.idCita === idCita ? { ...x, ...cambios } : x)));
    },
    quitar(idCita) {
      this.guardar(this.leer().filter((x) => x.idCita !== idCita));
    },
  };

  function cajaError(msg, reintentar) {
    const b = el("button", { type: "button", class: "btn sec" }, "Reintentar");
    b.addEventListener("click", reintentar);
    return el("div", "fallo", `No se pudieron cargar los horarios. ${msg}`, el("br"), b);
  }

  /* ================= Horarios disponibles ================= */
  function pintarHorarios(cont) {
    let todos = [];
    const selTrab = el("select", { id: "fTrab" }, el("option", { value: "" }, "Todos los trabajadores"));
    const fFecha = el("input", { type: "date", id: "fFecha" });
    const chkPasados = el("input", { type: "checkbox", id: "fPasados" });
    const btnAct = el("button", { type: "button", class: "btn sec" }, "Actualizar");
    const lista = el("div", { id: "listaHorarios" });

    cont.append(
      el(
        "div",
        "herramientas",
        el("div", "campo", el("label", { for: "fTrab" }, "Trabajador"), selTrab),
        el("div", "campo", el("label", { for: "fFecha" }, "Fecha"), fFecha),
        el("div", "campo check", chkPasados, el("label", { for: "fPasados" }, "Mostrar horarios que ya pasaron")),
        btnAct,
      ),
      lista,
    );

    async function cargar() {
      lista.replaceChildren(el("p", "vacio", "Cargando horarios…"));
      try {
        todos = await Horarios.todos();
      } catch (e) {
        lista.replaceChildren(cajaError(e.message, cargar));
        return;
      }
      const previo = selTrab.value;
      const trabajadores = new Map();
      todos.filter(Horarios.disponible).forEach((h) => trabajadores.set(h.idTrabajador, h.trabajador));
      selTrab.replaceChildren(
        el("option", { value: "" }, "Todos los trabajadores"),
        ...[...trabajadores].map(([id, n]) => el("option", { value: id }, n || `Trabajador ${id}`)),
      );
      selTrab.value = trabajadores.has(Number(previo)) ? previo : "";
      pintar();
    }

    function pintar() {
      const libres = todos.filter(Horarios.disponible);
      const pasados = libres.filter((h) => Horarios.esPasado(h)).length;
      let l = chkPasados.checked ? libres : libres.filter((h) => !Horarios.esPasado(h));
      if (selTrab.value) l = l.filter((h) => String(h.idTrabajador) === selTrab.value);
      if (fFecha.value) l = l.filter((h) => h.fecha === fFecha.value);
      let vacio = "No hay horarios disponibles por ahora. Vuelve a revisar más tarde.";
      if (!l.length && pasados && !chkPasados.checked)
        vacio += ` (Hay ${pasados} horario(s) libre(s) con fecha ya vencida; actívalos con «Mostrar horarios que ya pasaron».)`;
      pintarAgenda(lista, l, {
        vacio,
        trabajador: true,
        estado: false,
        acciones: (h) => {
          if (Horarios.esPasado(h)) return [el("span", "estado", "ya pasó")];
          const b = el("button", { type: "button", class: "btn pequeno" }, "Reservar");
          b.addEventListener("click", () => reservar(h, b));
          return [b];
        },
      });
    }

    async function reservar(h, boton) {
      const ok = await confirmar(
        "Reservar cita",
        `¿Reservar el ${formatoDia(h.fecha)} a las ${formatoHora(h.horaInicio)} con ${h.trabajador || "el trabajador"}?`,
        { boton: "Reservar" },
      );
      if (!ok) return;
      await conCarga(boton, async () => {
        const r = await api("/citas", {
          method: "POST",
          body: { idCliente, idTrabajador: h.idTrabajador, idHorario: h.id },
        });
        if (!r.ok) {
          toast(r.error, "error");
          if (r.status === 409) await cargar(); // el horario ya no estaba libre
          return;
        }
        Citas.agregar({
          idCita: r.datos.idCita,
          idHorario: h.id,
          idTrabajador: h.idTrabajador,
          trabajador: h.trabajador,
          fecha: h.fecha,
          horaInicio: h.horaInicio,
          horaFinal: h.horaFinal,
          estado: "Activa",
        });
        toast(`Cita #${r.datos.idCita} reservada correctamente. La encuentras en «Mis citas».`);
        await cargar();
      });
    }

    [selTrab, fFecha, chkPasados].forEach((c) => c.addEventListener("change", pintar));
    btnAct.addEventListener("click", cargar);
    cargar();
  }

  /* ================= Mis citas ================= */
  function pintarCitas(cont) {
    const entrada = el("input", { type: "number", min: "1", id: "idCitaNueva", placeholder: "Ej. 5", inputmode: "numeric" });
    const btnAdd = el("button", { type: "submit", class: "btn sec" }, "Agregar");
    const form = el(
      "form",
      { class: "herramientas", novalidate: true },
      el("div", "campo", el("label", { for: "idCitaNueva" }, "¿Tienes una cita hecha antes? Agrégala con su número"), entrada),
      btnAdd,
    );
    const lista = el("div", { class: "citas" });
    cont.append(form, lista);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = Number(entrada.value);
      if (!Number.isInteger(id) || id < 1) return toast("Escribe un número de cita válido.", "error");
      if (Citas.leer().some((c) => c.idCita === id)) return toast("Esa cita ya está en tu lista.", "error");
      Citas.agregar({ idCita: id, estado: "Activa" });
      entrada.value = "";
      dibujar();
    });

    function dibujar() {
      const citas = Citas.leer().sort((a, b) => b.idCita - a.idCita);
      if (!citas.length) {
        lista.replaceChildren(
          el("p", "vacio", "Aún no tienes citas en este navegador. Reserva una en «Horarios disponibles» o agrega una por su número."),
        );
        return;
      }
      lista.replaceChildren(...citas.map(tarjeta));
    }

    function tarjeta(c) {
      const activa = c.estado === "Activa";
      const detalle = c.fecha
        ? el("div", null, `${formatoDia(c.fecha)} · ${formatoHora(c.horaInicio)} a ${formatoHora(c.horaFinal)}`)
        : el("div", "ayuda", "Sin detalles guardados. Puedes cancelarla o reprogramarla igualmente.");
      const acciones = el("div", "acciones-fila");
      if (activa) {
        const rep = el("button", { type: "button", class: "btn sec pequeno" }, "Reprogramar");
        const can = el("button", { type: "button", class: "btn peligro pequeno" }, "Cancelar cita");
        rep.addEventListener("click", () => reprogramar(c));
        can.addEventListener("click", () => cancelar(c, can));
        acciones.append(rep, can);
      }
      const quitar = el("button", { type: "button", class: "btn sec pequeno" }, "Quitar de la lista");
      quitar.addEventListener("click", () => {
        Citas.quitar(c.idCita);
        dibujar();
      });
      acciones.append(quitar);
      return el(
        "article",
        "cita " + (activa ? "activa" : "cancelada"),
        el("div", "cita-info", el("strong", null, `Cita #${c.idCita}`), detalle, c.trabajador ? el("div", null, `con ${c.trabajador}`) : null),
        el("span", "estado " + (activa ? "disponible" : "cancelado"), activa ? "Activa" : "Cancelada"),
        acciones,
      );
    }

    async function cancelar(c, boton) {
      const ok = await confirmar("Cancelar cita", `¿Cancelar la cita #${c.idCita}? El horario quedará libre para otros clientes.`, {
        boton: "Sí, cancelar",
        peligro: true,
      });
      if (!ok) return;
      await conCarga(boton, async () => {
        const r = await api(`/citas/${c.idCita}/cancelar`, { method: "PUT", body: { idcliente: idCliente } });
        if (!r.ok) return toast(r.error, "error");
        Citas.cambiar(c.idCita, { estado: "Cancelada" });
        toast(r.datos.mensaje || "Cita cancelada correctamente.");
        dibujar();
      });
    }

    async function reprogramar(c) {
      const cuerpo = el("div", "modal-cuerpo", el("p", "vacio", "Cargando horarios…"));
      const dlg = modal(`Reprogramar cita #${c.idCita}`, cuerpo);
      let todos;
      try {
        todos = await Horarios.todos();
      } catch (e) {
        cuerpo.replaceChildren(el("p", "fallo", e.message));
        return;
      }
      let l = todos.filter((h) => Horarios.disponible(h) && !Horarios.esPasado(h) && h.id !== c.idHorario);
      if (c.idTrabajador) l = l.filter((h) => h.idTrabajador === c.idTrabajador);
      const caja = el("div", "lista-modal");
      pintarAgenda(caja, l, {
        vacio: "No hay otros horarios libres con el mismo trabajador.",
        trabajador: !c.idTrabajador,
        estado: false,
        acciones: (h) => {
          const b = el("button", { type: "button", class: "btn pequeno" }, "Elegir");
          b.addEventListener("click", () =>
            conCarga(b, async () => {
              const r = await api(`/citas/${c.idCita}/reprogramar`, {
                method: "PUT",
                body: { idcliente: idCliente, idhorario: h.id },
              });
              if (!r.ok) return toast(r.error, "error");
              Citas.cambiar(c.idCita, {
                idHorario: h.id,
                idTrabajador: h.idTrabajador,
                trabajador: h.trabajador,
                fecha: String(dato(r.datos.cita, "fecha") ?? h.fecha).slice(0, 10),
                horaInicio: dato(r.datos.cita, "horaInicio") ?? h.horaInicio,
                horaFinal: dato(r.datos.cita, "horaFinal") ?? h.horaFinal,
              });
              dlg.close();
              toast(r.datos.mensaje || "Cita reprogramada correctamente.");
              dibujar();
            }),
          );
          return [b];
        },
      });
      cuerpo.replaceChildren(
        el("p", "ayuda", "Solo puedes cambiar a un horario libre del mismo trabajador, con al menos una hora de anticipación."),
        caja,
      );
    }

    dibujar();
  }

  /* ================= Mi cuenta ================= */
  function pintarCuenta(cont) {
    const fila = (t, v) => [el("dt", null, t), el("dd", null, v || "—")];
    const btn = el("button", { type: "button", class: "btn peligro" }, "Desactivar mi cuenta");
    cont.append(
      el(
        "section",
        "tarjeta",
        el("h2", null, "Mis datos"),
        el(
          "dl",
          "datos",
          fila("Nombre", u.nombres),
          fila("Documento", `${u.tipoDocumento || ""} ${u.numeroDocumento || ""}`.trim()),
          fila("Correo", u.correo),
          fila("Teléfono", u.telefono),
          fila("Dirección", u.direccion),
        ),
      ),
      el(
        "section",
        "tarjeta zona-peligro",
        el("h2", null, "Desactivar cuenta"),
        el("p", null, "Si desactivas tu cuenta ya no podrás ingresar ni reservar citas. Solo la administración puede volver a activarla."),
        btn,
      ),
    );
    btn.addEventListener("click", async () => {
      const activas = Citas.leer().filter((c) => c.estado === "Activa").length;
      const extra = activas ? ` Tienes ${activas} cita(s) activa(s) registrada(s) aquí; cancélalas antes si ya no las necesitas.` : "";
      const ok = await confirmar("Desactivar cuenta", "¿Seguro que quieres desactivar tu cuenta?" + extra, {
        boton: "Sí, desactivar",
        peligro: true,
      });
      if (!ok) return;
      await conCarga(btn, async () => {
        const r = await api(`/usuario/desactivar/${idCliente}`, { method: "PUT" });
        if (!r.ok) return toast(r.error, "error");
        Sesion.salir();
        Flash.poner("Tu cuenta fue desactivada correctamente.");
        location.replace("../index.html");
      });
    });
  }

  pestanas(
    document.getElementById("pestanas"),
    document.getElementById("contenido"),
    [
      { id: "horarios", titulo: "Horarios disponibles", render: pintarHorarios },
      { id: "citas", titulo: "Mis citas", render: pintarCitas },
      { id: "cuenta", titulo: "Mi cuenta", render: pintarCuenta },
    ],
    location.hash.slice(1),
  );
});
