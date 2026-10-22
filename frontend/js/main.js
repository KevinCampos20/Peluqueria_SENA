"use strict";
/* Acceso: inicio de sesión por rol (RF-03, RF-05, RF-17) y registro de cliente (RF-02) */

const LOGIN = {
  cliente: { ruta: "/cliente/login", etiqueta: "Cliente" },
  trabajador: { ruta: "/trabajador/login", etiqueta: "Trabajador" },
  admin: { ruta: "/seguridad/login", etiqueta: "Administrador" },
};

document.addEventListener("DOMContentLoaded", () => {
  const u = Sesion.usuario();
  if (u) {
    location.replace(`vistas/${Sesion.rol(u)}.html`);
    return;
  }

  const barra = document.getElementById("pestanasAcceso");
  const panel = document.getElementById("panelAcceso");
  let correoNuevo = "";

  /* ---------- Iniciar sesión ---------- */
  function pintarLogin(cont) {
    let rolElegido = "cliente";
    try {
      rolElegido = LOGIN[localStorage.getItem("rolPeluqueria")] ? localStorage.getItem("rolPeluqueria") : "cliente";
    } catch {}

    const aviso = el("p", { class: "aviso", role: "status", "aria-live": "polite" });
    const flash = Flash.tomar();
    if (flash) {
      aviso.textContent = flash;
      aviso.className = "aviso ok";
    }
    const msg = (t, tipo) => {
      aviso.textContent = t;
      aviso.className = "aviso " + tipo;
    };

    const correo = el("input", { type: "email", id: "correo", placeholder: "nombre@correo.com", autocomplete: "username", required: true, value: correoNuevo });
    const clave = el("input", { type: "password", id: "contrasena", autocomplete: "current-password", required: true });
    const ver = el("button", { type: "button", "aria-pressed": "false" }, "Mostrar");
    ver.addEventListener("click", () => {
      const oculta = clave.type === "password";
      clave.type = oculta ? "text" : "password";
      ver.textContent = oculta ? "Ocultar" : "Mostrar";
      ver.setAttribute("aria-pressed", String(oculta));
    });

    const grupo = el("fieldset", "segmentado", el("legend", null, "Ingresar como"));
    Object.entries(LOGIN).forEach(([rol, c]) => {
      const id = "rol-" + rol;
      grupo.append(
        el("input", { type: "radio", name: "rol", id, value: rol, checked: rol === rolElegido }),
        el("label", { for: id }, c.etiqueta),
      );
    });

    const boton = el("button", { type: "submit", class: "btn", id: "btnIngresar" }, "Ingresar");
    const form = el(
      "form",
      { id: "loginForm", novalidate: true },
      el("h2", null, "Iniciar sesión"),
      el("p", "sub", "Elige tu tipo de cuenta e ingresa tus datos."),
      grupo,
      el("div", "campo", el("label", { for: "correo" }, "Correo electrónico"), correo),
      el("div", "campo", el("label", { for: "contrasena" }, "Contraseña"), el("div", "clave", clave, ver)),
      boton,
      aviso,
    );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rol = form.elements.rol.value;
      const email = correo.value.trim();
      if (!email || !clave.value) return msg("Escribe tu correo y tu contraseña.", "error");
      await conCarga(boton, async () => {
        msg("Validando credenciales…", "cargando");
        const r = await api(LOGIN[rol].ruta, { method: "POST", body: { t1: email, t2: clave.value } });
        if (!r.ok) return msg(r.error, "error");
        const usuario = r.datos.usuario;
        if (!usuario) return msg("Respuesta inesperada del servidor.", "error");

        // El login de trabajador consulta la misma tabla que el de admin: se valida el rol elegido.
        if (rol === "trabajador" && usuario.rol === "admin")
          return msg("Esta cuenta es de administrador. Elige «Administrador» para ingresar.", "error");
        // El login de cliente no valida el estado de la cuenta; se valida aquí.
        if (rol === "cliente" && String(usuario.estado || "Activo").toLowerCase() === "inactivo")
          return msg("Tu cuenta está desactivada. Comunícate con la administración.", "error");

        try {
          localStorage.setItem("rolPeluqueria", rol);
        } catch {}
        Sesion.guardar(usuario);
        msg("Bienvenido. Entrando…", "ok");
        location.href = `vistas/${Sesion.rol(usuario)}.html`;
      });
    });
    cont.replaceChildren(form);
    correo.focus();
  }

  /* ---------- Crear cuenta de cliente (RF-02) ---------- */
  function pintarRegistro(cont) {
    const form = formularioUsuario({
      boton: "Crear mi cuenta",
      enviar: (body) => api("/usuario/crear", { method: "POST", body }),
      alExito: (_r, body) => {
        correoNuevo = body.t6;
        Flash.poner("Cuenta creada correctamente. Ya puedes iniciar sesión.");
        mostrar("ingresar");
      },
    });
    cont.replaceChildren(
      el("div", "registro", el("h2", null, "Crear cuenta de cliente"), el("p", "sub", "Regístrate para reservar tus citas."), form),
    );
  }

  pestanas(barra, panel, [
    { id: "ingresar", titulo: "Ingresar", render: pintarLogin },
    { id: "registro", titulo: "Crear cuenta", render: pintarRegistro },
  ]);
  const mostrar = (id) => document.getElementById("tab-" + id).click();

  /* ---------- Configuración del servidor ---------- */
  const url = document.getElementById("urlApi");
  const avisoApi = document.getElementById("avisoApi");
  url.value = Config.api();
  document.getElementById("guardarApi").addEventListener("click", () => {
    Config.fijarApi(url.value);
    url.value = Config.api();
    avisoApi.textContent = "Dirección guardada.";
    avisoApi.className = "aviso ok";
  });
  document.getElementById("probarApi").addEventListener("click", async () => {
    Config.fijarApi(url.value);
    avisoApi.textContent = "Probando…";
    avisoApi.className = "aviso cargando";
    const r = await api("/");
    avisoApi.textContent = r.status === 0 ? r.error : `Servidor respondió (${r.status}). Todo listo.`;
    avisoApi.className = "aviso " + (r.status === 0 ? "error" : "ok");
  });
});
