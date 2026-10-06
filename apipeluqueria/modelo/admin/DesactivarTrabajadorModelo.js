const dbService = require('../bd/Conexion');

class DesactivarTrabajadorModelo {

    // Cambia el estado del trabajador a 'Inactivo'.
    // Devuelve el resultado de MySQL; el controlador revisa affectedRows.
    static async modificarEstado(id) {
        const query = 'UPDATE trabajadores SET estado = ? WHERE idtrabajador = ?';

        try {
            return await dbService.query(query, ['Inactivo', id]);
        } catch (err) {
            throw new Error(`Error al modificar el estado del trabajador: ${err.message}`);
        }
    }
}

module.exports = DesactivarTrabajadorModelo;