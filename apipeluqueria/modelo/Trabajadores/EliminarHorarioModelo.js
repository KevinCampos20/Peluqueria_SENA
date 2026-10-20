const dbService = require('../bd/Conexion');

class EliminarHorarioModelo {

    // Busca el horario para saber si existe
    static async buscarPorId(idhorario) {

        const query = `
            SELECT idHorario, fecha, horaInicio, horaFinal, estado
            FROM horarios
            WHERE idHorario = ?
        `;

        try {
            const resultado = await dbService.query(query, [idhorario]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar el horario: ${err.message}`);
        }
    }

    // Revisa si el horario pertenece al trabajador (tabla reghorarios)
    static async esDelTrabajador(idhorario, idtrabajador) {

        const query = `
            SELECT COUNT(*) AS total
            FROM reghorarios
            WHERE idHorario = ?
              AND idTrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idhorario, idtrabajador]);
            return resultado[0].total > 0;
        } catch (err) {
            throw new Error(`Error al validar el dueño del horario: ${err.message}`);
        }
    }

    // Cuenta las citas asociadas al horario (de cualquier estado)
    static async contarCitas(idhorario) {

        const query = `
            SELECT COUNT(*) AS total
            FROM citas
            WHERE idHorario = ?
        `;

        try {
            const resultado = await dbService.query(query, [idhorario]);
            return resultado[0].total;
        } catch (err) {
            // bdpeluqueria.sql todavía no trae la tabla citas: sin tabla no hay citas que impidan eliminar
            if (err.code === 'ER_NO_SUCH_TABLE') {
                return 0;
            }
            throw new Error(`Error al consultar las citas del horario: ${err.message}`);
        }
    }

    // Elimina el horario (reghorarios se borra sola por el ON DELETE CASCADE)
    static async eliminarHorario(idhorario) {

        const query = `
            DELETE FROM horarios
            WHERE idHorario = ?
        `;

        try {
            return await dbService.query(query, [idhorario]);
        } catch (err) {
            throw new Error(`Error al eliminar el horario: ${err.message}`);
        }
    }
}

module.exports = EliminarHorarioModelo;