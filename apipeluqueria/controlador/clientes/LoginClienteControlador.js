/*
Este es rf-03 login cliente funcion validarCredencial
*/

const modelo = require('../../modelo/clientes/LoginClienteModelo');


class LoginClienteControlador {
  // Validar correo y contraseña
  static async validarCredencial(req, res) {
    const { t1: email, t2: password } = req.body; // Renombramos t1 y t2 para mayor claridad

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
      const user = await modelo.validarCredenciales(email, password);
      
      if (!user) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      }

      if (user.estado !== 'Activo') {
        return res.status(403).json({ error: 'La cuenta está inactiva. Comuníquese con el administrador.' });
      }

      const { contrasena, ...usuarioSinClave } = user;
      res.json({ mensaje: 'Inicio de sesión exitoso', usuario: usuarioSinClave });
      
    } catch (err) {
      res.status(500).json({ error: `Hubo un error al validar las credenciales: ${err.message}` });
    }
  }
}

module.exports = LoginClienteControlador;