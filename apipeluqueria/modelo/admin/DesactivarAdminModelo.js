const dbService = require('../bd/Conexion');

class DesactivarAdminModelo {
    static async modificarEstado(id) {
        // Apuntamos a la tabla 'trabajadores' y a la columna 'idtrabajador'
        const query = 'UPDATE trabajadores SET estado = ? WHERE idtrabajador = ?';

        try {
            return await dbService.query(query, ['Inactivo', id]);
        } catch (err) {
            throw new Error(`Error al modificar el estado del admin: ${err.message}`);
        }
    }
}

module.exports = DesactivarAdminModelo;