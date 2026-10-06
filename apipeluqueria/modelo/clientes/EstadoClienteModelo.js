const dbService = require('../bd/Conexion');

class EstadoClienteModelo {

    // Busca el cliente para saber si existe y cuál es su estado actual
    static async buscarPorId(idcliente) {

        const query = `
            SELECT idcliente, nombres, estado
            FROM clientes
            WHERE idcliente = ?
        `;

        try {
            const resultado = await dbService.query(query, [idcliente]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar el cliente: ${err.message}`);
        }
    }

    // Cambia el estado del cliente ('Activo' o 'Inactivo')
    static async cambiarEstado(idcliente, estado) {

        const query = `
            UPDATE clientes
            SET estado = ?
            WHERE idcliente = ?
        `;

        try {
            const resultado = await dbService.query(query, [estado, idcliente]);
            return resultado;
        } catch (err) {
            throw new Error(`Error al cambiar el estado del cliente: ${err.message}`);
        }
    }
}

module.exports = EstadoClienteModelo;