const dbService = require('../bd/Conexion');

class EliminarHorariosAdminModelo {

    // Busca el horario para saber si existe
    static async buscarPorId(idhorario) {

        const query = `
            SELECT idhorario, idtrabajador, fecha, horaInicio, horaFin, estado
            FROM horarios
            WHERE idhorario = ?
        `;

        try {
            const resultado = await dbService.query(query, [idhorario]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar el horario: ${err.message}`);
        }
    }

    // Elimina el horario
    static async eliminarHorario(idhorario) {

        const query = `
            DELETE FROM horarios
            WHERE idhorario = ?
        `;

        try {
            const resultado = await dbService.query(query, [idhorario]);
            return resultado;
        } catch (err) {
            throw new Error(`Error al eliminar el horario: ${err.message}`);
        }
    }
}

module.exports = EliminarHorariosAdminModelo;