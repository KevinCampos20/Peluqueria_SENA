const dbService = require('../bd/Conexion');

class ActivarAdminModelo {
    static async modificarEstado(id) {
        // CORRECCIÓN: Igual que antes, cambiamos la tabla a 'trabajadores' y la columna a 'idtrabajador'
        const query = 'UPDATE trabajadores SET estado = ? WHERE idtrabajador = ?';

        try {
            // Nota que aquí le pasamos 'Activo'
            return await dbService.query(query, ['Activo', id]); 
        } catch (err) {
            throw new Error(`Error al modificar el estado del admin: ${err.message}`);
        }
    }
}

module.exports = ActivarAdminModelo;