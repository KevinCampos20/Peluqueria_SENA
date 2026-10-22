"use strict";
/* ============================================================
   Núcleo compartido: API, sesión, utilidades de interfaz y
   formulario de usuarios (lo usan el registro y el panel admin).
   ============================================================ */

const API_DEFECTO = "http://localhost:3333"; // Puerto por defecto del backend (.env → PORT)
const CLAVE_SESION = "usuarioPeluqueria";
const CLAVE_API = "apiPeluqueria";

/* ---------- Configuración del servidor ---------- */
const Config = {
  api() {
    try {
      return (localStorage.getItem(CLAVE_API) || API_DEFECTO).replace(/\/+$/, "");
    } catch {
      return API_DEFECTO;
    }
  },
  fijarApi(url) {
    const limpia = String(url || "").trim().replace(/\/+$/, "");
    if (!limpia || limpia === API_DEFECTO) localStorage.removeItem(CLAVE_API);
    else localStorage.setItem(CLAVE_API, limpia);
  },
};

/* ---------- Acceso a objetos sin importar mayúsculas ---------- */
// Los endpoints devuelven nombres distintos (idhorario / idHorario, etc.)
function dato(obj, ...nombres) {
  if (!obj || typeof obj !== "object") return undefined;
  const claves = Object.keys(obj);
  for (const n of nombres) {
    const k = claves.find((c) => c.toLowerCase() === n.toLowerCase());
    if (k !== undefined && obj[k] !== null && obj[k] !== undefined) return obj[k];
  }
  return undefined;
}

/* ---------- Llamadas a la API ---------- */
// Siempre devuelve { ok, status, datos, error }. Nunca lanza excepciones.
async function api(ruta, { method = "GET", body } = {}) {
  let r;
  try {
    r = await fetch(Config.api() + ruta, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      datos: {},
      error: `No hay conexión con el servidor (${Config.api()}). Verifica que el backend esté encendido.`,
    };
  }
  const datos = await r.json().catch(() => ({}));
  let error = null;
  if (!r.ok) {
    // Unos endpoints responden { error } y otros { mensaje }
    error = datos.error || datos.mensaje || `El servidor respondió con un error (${r.status}).`;
    if (datos.sugerencia) error += " " + datos.sugerencia;
  }
  return { ok: r.ok, status: r.status, datos, error };
}

/* ---------- Sesión ---------- */
const Sesion = {
  usuario() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_SESION));
    } catch {
      return null;
    }
  },
  guardar(u) {
    // Nunca se guarda el hash de la contraseña en el navegador
    const { contrasena, ...limpio } = u;
    localStorage.setItem(CLAVE_SESION, JSON.stringify(limpio));
  },
  salir() {
    localStorage.removeItem(CLAVE_SESION);
  },
  // Los clientes no traen "rol" desde la API
  rol(u) {
    return u && (u.rol === "admin" || u.rol === "trabajador") ? u.rol : "cliente";
  },
  id(u) {
    return Number(dato(u, "idTrabajador", "idCliente", "id"));
  },
  // Guarda de rol (solo UX; la seguridad real debe ir en el backend)
  proteger(rolEsperado) {
    const u = this.usuario();
    if (!u) {
      location.replace("../index.html");
      return null;
    }
    if (this.rol(u) !== rolEsperado) {
      location.replace(`${this.rol(u)}.html`);
      return null;
    }
    return u;
  },
};

// Mensaje que se muestra una vez en la pantalla de acceso
const Flash = {
  poner(t) {
    try {
      sessionStorage.setItem("flashPeluqueria", t);
    } catch {}
  },
  tomar() {
    try {
      const t = sessionStorage.getItem("flashPeluqueria");
      sessionStorage.removeItem("flashPeluqueria");
      return t;
    } catch {
      return null;
    }
  },
};

/* ---------- Creación de elementos (siempre con textContent: sin XSS) ---------- */
function el(tag, attrs, ...hijos) {
  const n = document.createElement(tag);
  if (typeof attrs === "string") n.className = attrs;
  else if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else if (["value", "checked", "disabled", "selected"].includes(k)) n[k] = v;
      else n.setAttribute(k, v === true ? "" : v);
    }
  }
  const poner = (h) => {
    if (h == null || h === false) return;
    if (Array.isArray(h)) h.forEach(poner);
    else n.append(h instanceof Node ? h : document.createTextNode(String(h)));
  };
  hijos.forEach(poner);
  return n;
}

/* ---------- Avisos emergentes ---------- */
function toast(texto, tipo = "ok") {
  let caja = document.getElementById("toasts");
  if (!caja) {
    caja = el("div", { id: "toasts", class: "toasts", role: "status", "aria-live": "polite" });
    document.body.append(caja);
  }
  // Un <dialog> abierto tapa todo el documento: el aviso debe vivir dentro de él
  (document.querySelector("dialog[open]") || document.body).append(caja);
  const t = el("div", "toast " + tipo, texto);
  caja.append(t);
  setTimeout(() => t.remove(), tipo === "error" ? 7000 : 4000);
}

/* ---------- Ventanas modales ---------- */
function modal(titulo, cuerpo) {
  const dlg = el("dialog", "modal");
  dlg.append(
    el(
      "div",
      "modal-cab",
      el("h2", null, titulo),
      el("button", { type: "button", class: "cerrar", "aria-label": "Cerrar", onclick: () => dlg.close() }, "×"),
    ),
    cuerpo,
  );
  dlg.addEventListener("close", () => dlg.remove());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close(); // clic en el fondo
  });
  document.body.append(dlg);
  dlg.showModal();
  return dlg;
}

function confirmar(titulo, texto, { boton = "Confirmar", peligro = false } = {}) {
  return new Promise((resolver) => {
    let acepto = false;
    const ok = el("button", { type: "button", class: "btn" + (peligro ? " peligro" : "") }, boton);
    const no = el("button", { type: "button", class: "btn sec" }, "Cancelar");
    const cuerpo = el("div", "modal-cuerpo", el("p", null, texto), el("div", "acciones", no, ok));
    const dlg = modal(titulo, cuerpo);
    ok.addEventListener("click", () => {
      acepto = true;
      dlg.close();
    });
    no.addEventListener("click", () => dlg.close());
    dlg.addEventListener("close", () => resolver(acepto));
    ok.focus();
  });
}

// Deshabilita un botón mientras se ejecuta una acción asíncrona
async function conCarga(boton, fn) {
  if (boton) boton.disabled = true;
  try {
    return await fn();
  } finally {
    if (boton) boton.disabled = false;
  }
}

/* ---------- Pestañas ---------- */
// paneles: [{ id, titulo, render(contenedor) }]
function pestanas(barra, contenedor, paneles, inicial) {
  const botones = {};
  function mostrar(id) {
    const p = paneles.find((x) => x.id === id) || paneles[0];
    for (const [k, b] of Object.entries(botones)) {
      b.setAttribute("aria-selected", String(k === p.id));
      b.tabIndex = k === p.id ? 0 : -1;
    }
    contenedor.replaceChildren();
    contenedor.setAttribute("aria-labelledby", "tab-" + p.id);
    p.render(contenedor);
    try {
      history.replaceState(null, "", "#" + p.id);
    } catch {}
  }
  barra.setAttribute("role", "tablist");
  contenedor.setAttribute("role", "tabpanel");
  paneles.forEach((p) => {
    const b = el("button", { type: "button", role: "tab", id: "tab-" + p.id, class: "pestana" }, p.titulo);
    b.addEventListener("click", () => mostrar(p.id));
    b.addEventListener("keydown", (e) => {
      const i = paneles.findIndex((x) => x.id === p.id);
      const salto = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!salto) return;
      const sig = paneles[(i + salto + paneles.length) % paneles.length].id;
      mostrar(sig);
      botones[sig].focus();
    });
    botones[p.id] = b;
    barra.append(b);
  });
  mostrar(inicial && paneles.some((p) => p.id === inicial) ? inicial : paneles[0].id);
}

/* ---------- Estructura común de los paneles ---------- */
function iniciarPanel(rol, etiqueta) {
  const u = Sesion.proteger(rol);
  if (!u) return null;
  document.getElementById("nombre").textContent = u.nombres || "Usuario";
  document.getElementById("rol").textContent = etiqueta;
  document.getElementById("btnCerrarSesion").addEventListener("click", () => {
    Sesion.salir();
    location.replace("../index.html");
  });
  return u;
}

/* ---------- Validación (misma que aplica el backend) ---------- */
const CAMPOS_USUARIO = [
  {
    clave: "t1",
    etiqueta: "Tipo de documento",
    tipo: "select",
    opciones: [
      ["CC", "Cédula de ciudadanía (CC)"],
      ["TI", "Tarjeta de identidad (TI)"],
      ["CE", "Cédula de extranjería (CE)"],
    ],
    validar: (v) => (/^(CC|TI|CE)$/.test(v) ? null : "Selecciona un tipo de documento."),
  },
  {
    clave: "t2",
    etiqueta: "Número de documento",
    inputmode: "numeric",
    maxlength: 10,
    validar: (v) => (/^\d{8,10}$/.test(v) ? null : "Debe tener entre 8 y 10 dígitos numéricos."),
  },
  {
    clave: "t3",
    etiqueta: "Nombres y apellidos",
    autocomplete: "name",
    maxlength: 100,
    validar: (v) =>
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,100}$/.test(v) ? null : "Solo letras y espacios (mínimo 3 caracteres).",
  },
  {
    clave: "t4",
    etiqueta: "Dirección",
    autocomplete: "street-address",
    maxlength: 200,
    validar: (v) =>
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s.,#/ºª-]{5,200}$/.test(v)
        ? null
        : "Mínimo 5 caracteres. Solo letras, números y los símbolos . , # - / º ª",
  },
  {
    clave: "t5",
    etiqueta: "Teléfono",
    inputmode: "numeric",
    maxlength: 10,
    autocomplete: "tel",
    validar: (v) => (/^\d{10}$/.test(v) ? null : "Debe tener exactamente 10 dígitos numéricos."),
  },
  {
    clave: "t6",
    etiqueta: "Correo electrónico",
    type: "email",
    maxlength: 250,
    autocomplete: "email",
    validar: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 250 ? null : "Correo inválido. Ejemplo: nombre@correo.com",
  },
  {
    clave: "t7",
    etiqueta: "Contraseña",
    type: "password",
    sinTrim: true,
    autocomplete: "new-password",
    validar: (v) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v)
        ? null
        : "Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.",
  },
];

/* Formulario de 7 campos (t1…t7) con validación en línea.
   enviar(body) debe devolver el resultado de api(). */
function formularioUsuario({ boton = "Guardar", enviar, alExito }) {
  const form = el("form", { class: "form-grid", novalidate: true });
  const entradas = {};
  const errores = {};

  CAMPOS_USUARIO.forEach((c) => {
    const id = "u-" + c.clave + "-" + Math.random().toString(36).slice(2, 7);
    let entrada;
    if (c.tipo === "select") {
      entrada = el("select", { id }, c.opciones.map(([v, t]) => el("option", { value: v }, t)));
    } else {
      entrada = el("input", {
        id,
        type: c.type || "text",
        inputmode: c.inputmode,
        maxlength: c.maxlength,
        autocomplete: c.autocomplete || "off",
      });
    }
    const err = el("small", { class: "error-campo", id: id + "-e" });
    entrada.setAttribute("aria-describedby", id + "-e");
    entradas[c.clave] = entrada;
    errores[c.clave] = err;

    let contenido = entrada;
    if (c.type === "password") {
      const ver = el("button", { type: "button", "aria-pressed": "false" }, "Mostrar");
      ver.addEventListener("click", () => {
        const oculta = entrada.type === "password";
        entrada.type = oculta ? "text" : "password";
        ver.textContent = oculta ? "Ocultar" : "Mostrar";
        ver.setAttribute("aria-pressed", String(oculta));
      });
      contenido = el("div", "clave", entrada, ver);
    }
    const bloque = el("div", "campo" + (c.clave === "t4" || c.clave === "t3" ? " ancho" : ""), el("label", { for: id }, c.etiqueta), contenido, err);
    form.append(bloque);
    entrada.addEventListener("input", () => {
      err.textContent = "";
      entrada.removeAttribute("aria-invalid");
    });
  });

  const aviso = el("p", { class: "aviso ancho", role: "alert" });
  const enviarBtn = el("button", { type: "submit", class: "btn" }, boton);
  form.append(el("div", "ancho", enviarBtn), aviso);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    aviso.textContent = "";
    aviso.className = "aviso ancho";
    const body = {};
    let primero = null;
    CAMPOS_USUARIO.forEach((c) => {
      const crudo = entradas[c.clave].value;
      const v = c.sinTrim ? crudo : crudo.trim();
      body[c.clave] = v;
      const msg = c.validar(v);
      errores[c.clave].textContent = msg || "";
      if (msg) {
        entradas[c.clave].setAttribute("aria-invalid", "true");
        primero = primero || entradas[c.clave];
      }
    });
    if (primero) {
      primero.focus();
      return;
    }
    await conCarga(enviarBtn, async () => {
      aviso.textContent = "Guardando…";
      aviso.className = "aviso ancho cargando";
      const r = await enviar(body);
      if (!r.ok) {
        aviso.textContent = r.error;
        aviso.className = "aviso ancho error";
        return;
      }
      aviso.textContent = "";
      aviso.className = "aviso ancho";
      form.reset();
      if (alExito) alExito(r, body);
    });
  });
  return form;
}
