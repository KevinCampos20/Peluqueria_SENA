const dbService = require('../bd/Conexion');

class EliminarClienteAdminModelo {

    // Busca el cliente para saber si existe
    static async buscarPorId(idcliente) {

        const query = `
            SELECT idcliente, nombres, numeroDocumento
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

    // Elimina el cliente
    static async eliminarCliente(idcliente) {

        const query = `
            DELETE FROM clientes
            WHERE idcliente = ?
        `;

        try {
            const resultado = await dbService.query(query, [idcliente]);
            return resultado;
        } catch (err) {
            throw new Error(`Error al eliminar el cliente: ${err.message}`);
        }
    }
}

module.exports = EliminarClienteAdminModelo;