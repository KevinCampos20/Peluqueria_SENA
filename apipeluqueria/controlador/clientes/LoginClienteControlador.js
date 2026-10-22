const modelo = require("../../modelo/clientes/LoginClienteModelo");

class LoginClienteControlador {
  static async validarCredencial(req, res) {
    const email = String(req.body?.t1 ?? "").trim().toLowerCase();
    const password = req.body?.t2;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        error: "Correo y contraseña son obligatorios.",
      });
    }

    try {
      const usuario = await modelo.validarCredenciales(email, password);

      if (!usuario) {
        return res.status(401).json({
          error: "Correo o contraseña incorrectos.",
        });
      }

      if (usuario.estado !== "Activo") {
        return res.status(403).json({
          error: "La cuenta está inactiva. Comunícate con la administración.",
        });
      }

      // Nunca enviar la contraseña ni su hash al cliente.
      const { contrasena, ...usuarioSeguro } = usuario;

      return res.status(200).json({
        mensaje: "Inicio de sesión exitoso.",
        usuario: usuarioSeguro,
      });
    } catch (err) {
      console.error("Error en el inicio de sesión del cliente:", err);

      return res.status(500).json({
        error: "No fue posible iniciar sesión. Intenta nuevamente.",
      });
    }
  }
}

module.exports = LoginClienteControlador;