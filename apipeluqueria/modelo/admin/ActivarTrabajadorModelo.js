const dbService = require('../bd/Conexion');

class ActivarTrabajadorModelo {

    // Cambia el estado del trabajador a 'Activo'.
    // Devuelve el resultado de MySQL; el controlador revisa affectedRows.
    static async modificarEstado(id) {
        const query = 'UPDATE trabajadores SET estado = ? WHERE idtrabajador = ?';

        try {
            return await dbService.query(query, ['Activo', id]);
        } catch (err) {
            throw new Error(`Error al modificar el estado del trabajador: ${err.message}`);
        }
    }
}

module.exports = ActivarTrabajadorModelo;