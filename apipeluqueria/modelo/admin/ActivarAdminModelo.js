const dbService = require("../bd/Conexion");

class ActivarAdminModelo {
  static async modificarEstado(id) {
    const query = `
      UPDATE trabajadores
      SET estado = 'Activo'
      WHERE idtrabajador = ?
        AND rol = 'admin'
    `;

    try {
      return await dbService.query(query, [id]);
    } catch (err) {
      console.error("Error al activar administrador:", err.message);
      throw err;
    }
  }
}

module.exports = ActivarAdminModelo;