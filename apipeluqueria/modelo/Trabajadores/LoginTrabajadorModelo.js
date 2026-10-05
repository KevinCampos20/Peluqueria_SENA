
const dbService = require('../bd/Conexion');
const bcrypt = require('bcrypt');


class LoginTrabajadorModelo {
  // Buscar usuario por correo
  static async buscaCorreo(email) {
    const query = 'SELECT * FROM trabajadores WHERE correo = ?';
    try {
      const result = await dbService.query(query, [email]);
      return result.length ? result[0] : null;
    } catch (err) {
      throw new Error(`Error al buscar el usuario : ${err.message}`);
    }
  }

  // Validar correo y contraseña
  static async validarCredenciales(email, password) {
    if (!email || !password) {
      throw new Error('Correo y contraseña son obligatorios');
    }

    try {
      const usuario = await this.buscaCorreo(email); // Se busca el correo
      if (!usuario) {
        return null; // Usuario no encontrado
      }

      // Comparar la contraseña encriptada
      const match = await bcrypt.compare(password, usuario.contrasena); // Cambiado a "contrasena"
      if (!match) {
        return null; // Contraseña incorrecta
      }

      return usuario; // Credenciales correctas
    } catch (err) {
      throw new Error(`Error al validar credenciales: ${err.message}`);
    }
  }
}

module.exports = LoginTrabajadorModelo;