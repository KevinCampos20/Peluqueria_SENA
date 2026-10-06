const dbService = require('../bd/Conexion');

class DesactivarClienteModelo {

    // Cambia el estado del cliente a 'Inactivo'.
    // Devuelve el resultado de MySQL; el controlador revisa affectedRows.
    static async modificarEstado(id) {
        const query = 'UPDATE clientes SET estado = ? WHERE idcliente = ?';

        try {
            return await dbService.query(query, ['Inactivo', id]);
        } catch (err) {
            throw new Error(`Error al modificar el estado del cliente: ${err.message}`);
        }
    }
}

module.exports = DesactivarClienteModelo;