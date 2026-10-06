document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensajeRespuesta = document.getElementById('mensajeRespuesta');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Limpiamos cualquier mensaje anterior y mostramos estado de carga
        mensajeRespuesta.textContent = "Validando credenciales...";
        mensajeRespuesta.style.color = "blue";

        // Capturamos los valores que el usuario escribió en las cajas de texto
        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;

        try {
            // Hacemos la petición POST a tu backend
            const respuesta = await fetch('http://localhost:5020/seguridad/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Enviamos los datos como t1 y t2 porque así los exige tu controlador LoginAdminControlador
                body: JSON.stringify({ t1: correo, t2: contrasena })
            });

            // Convertimos la respuesta del servidor a formato JSON
            const datos = await respuesta.json();

            // Si la respuesta es exitosa (código 200 OK)
            if (respuesta.ok) {
                mensajeRespuesta.style.color = "green";
                mensajeRespuesta.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";
                
                // 1. Guardar los datos del usuario en el navegador para usarlos en otras pantallas
                localStorage.setItem('usuarioPeluqueria', JSON.stringify(datos.usuario));

                // 2. Redirigir a la pantalla correspondiente según el rol que nos dio la base de datos
                setTimeout(() => {
                    if (datos.usuario.rol === 'admin') {
                        window.location.href = 'vistas/admin.html';
                    } else if (datos.usuario.rol === 'trabajador') {
                        window.location.href = 'vistas/trabajador.html';
                    } else {
                        window.location.href = 'vistas/cliente.html'; // Por defecto, si es cliente
                    }
                }, 1500); // Espera 1.5 segundos para que el usuario lea el mensaje verde
            
            } else {
                // Si el backend devuelve un error (ej. credenciales incorrectas o falta de permisos)
                mensajeRespuesta.style.color = "red";
                // Mostramos el error exacto que enviaste desde tu res.status().json({ error: ... })
                mensajeRespuesta.textContent = datos.error || "Error al iniciar sesión.";
            }

        } catch (error) {
            // Si el servidor Node.js está apagado o hay un problema de red
            console.error("Error de conexión:", error);
            mensajeRespuesta.style.color = "red";
            mensajeRespuesta.textContent = "Error al conectar con el servidor. Verifica que tu backend esté corriendo.";
        }
    });
});