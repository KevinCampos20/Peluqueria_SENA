// Login: prueba primero personal (trabajador/admin) y luego cliente
document.addEventListener('DOMContentLoaded', () => {
  const u = Sesion.usuario();
  if (u) { location.replace(`vistas/${Sesion.rol(u)}.html`); return; }

  const form = document.getElementById('loginForm');
  const aviso = document.getElementById('mensajeRespuesta');
  const boton = document.getElementById('btnIngresar');
  const clave = document.getElementById('contrasena');
  const ver = document.getElementById('verClave');
  const msg = (t, tipo) => { aviso.textContent = t; aviso.className = 'aviso ' + tipo; };

  ver.addEventListener('click', () => {
    const oculta = clave.type === 'password';
    clave.type = oculta ? 'text' : 'password';
    ver.textContent = oculta ? 'Ocultar' : 'Mostrar';
    ver.setAttribute('aria-pressed', oculta);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    boton.disabled = true; msg('Validando credenciales…', 'cargando');
    const body = { t1: document.getElementById('correo').value.trim(), t2: clave.value };
    try {
      let r = await api('/trabajador/login', { method: 'POST', body });
      if (r.status === 401) r = await api('/login', { method: 'POST', body });
      if (!r.ok) { msg(r.datos.error || 'No se pudo iniciar sesión.', 'error'); boton.disabled = false; return; }
      Sesion.guardar(r.datos.usuario);
      msg('Bienvenido. Entrando…', 'ok');
      location.href = `vistas/${Sesion.rol(r.datos.usuario)}.html`;
    } catch {
      msg('No hay conexión con el servidor. Verifica que el backend esté encendido.', 'error');
      boton.disabled = false;
    }
  });
});
