# Frontend · Peluquería

HTML/CSS/JS puro (sin build). Sirve la carpeta con cualquier servidor estático
(`npx serve frontend`, extensión Live Server, etc.) y abre `index.html`.
La URL del backend es `http://localhost:3333` por defecto; se cambia desde
«Configurar servidor» en la pantalla de acceso.

## Archivos
- `js/app.js` núcleo: API, sesión, modales, avisos, pestañas, formulario de usuario con validación.
- `js/horarios.js` modelo de horarios, reglas de jornada, lista por día y formulario de edición.
- `js/main.js` acceso y registro · `cliente.js` · `trabajador.js` · `admin.js` paneles por rol.

## Endpoints conectados
| Pantalla | RF | Endpoint |
|---|---|---|
| Login cliente / trabajador / admin | 03 / 05 / 17 | POST `/cliente/login`, `/trabajador/login`, `/seguridad/login` |
| Crear cuenta | 02 | POST `/usuario/crear` |
| Horarios libres (cliente) | 06 | GET `/horarios` (si no existe, se reúnen con RF-07) |
| Reservar / cancelar / reprogramar | 26 / 15.1 / 15.2 | POST `/citas`, PUT `/citas/:id/cancelar`, `/citas/:id/reprogramar` |
| Desactivar mi cuenta | 22 | PUT `/usuario/desactivar/:id` |
| Agenda del trabajador | 08.1 / 08.2 / 08.3 | GET `/trabajador/horariot/:id`, `horariod/:id&:fecha`, `horarioe/:id&:fecha&:est` |
| Editar / eliminar horario (trabajador) | 09 / 10 | PUT / DELETE `/trabajador/horarios/:id` |
| Horarios (admin) | 07 / 11 / 12 | GET `/seguridad/horarios/:idtrabajador`, PUT / DELETE `/seguridad/horarios/:id` |
| Crear trabajador / cliente / admin | 04 / 01 / 16 | POST `/seguridad/creartrabajador`, `crearcliente`, `crearadmin` |
| Activar / desactivar | 18–21, 23, 24 | PUT `/seguridad/(activar\|desactivar)(cliente\|trabajador\|admin)/:id` |
| Eliminar | 13 / 14 / 25 | DELETE `/seguridad/trabajadores/:id`, `/clientes/:id`, `/admins/:id` |
