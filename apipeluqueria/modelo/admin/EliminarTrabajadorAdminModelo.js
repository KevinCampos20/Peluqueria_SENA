const dbService = require('../bd/Conexion');

class EliminarTrabajadorAdminModelo {

    // Busca el trabajador para saber si existe y qué rol tiene
    static async buscarPorId(idtrabajador) {

        const query = `
            SELECT idtrabajador, nombres, rol
            FROM trabajadores
            WHERE idtrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idtrabajador]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar el trabajador: ${err.message}`);
        }
    }

    // Cuenta cuántos horarios tiene el trabajador
    static async contarHorarios(idtrabajador) {

        const query = `
            SELECT COUNT(*) AS total
            FROM horarios
            WHERE idtrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idtrabajador]);
            return resultado[0].total;
        } catch (err) {
            throw new Error(`Error al consultar los horarios del trabajador: ${err.message}`);
        }
    }

    // Elimina el trabajador
    static async eliminarTrabajador(idtrabajador) {

        const query = `
            DELETE FROM trabajadores
            WHERE idtrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idtrabajador]);
            return resultado;
        } catch (err) {
            throw new Error(`Error al eliminar el trabajador: ${err.message}`);
        }
    }
}

module.exports = EliminarTrabajadorAdminModelo;