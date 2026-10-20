const dbService = require('../bd/Conexion');

class EditarHorarioModelo {

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

    // Trae los otros horarios del trabajador en esa fecha (sin contar el que se edita)
    static async buscarHorariosDelDia(idtrabajador, fecha, idhorario) {

        const query = `
            SELECT h.idHorario, h.horaInicio, h.horaFinal
            FROM horarios h
            INNER JOIN reghorarios rh
                ON rh.idHorario = h.idHorario
            WHERE rh.idTrabajador = ?
              AND h.fecha = ?
              AND h.idHorario <> ?
        `;

        try {
            return await dbService.query(query, [idtrabajador, fecha, idhorario]);
        } catch (err) {
            throw new Error(`Error al consultar los horarios del día: ${err.message}`);
        }
    }

    // Actualiza fecha y horas del horario
    static async editarHorario(idhorario, fecha, horaInicio, horaFinal) {

        const query = `
            UPDATE horarios
            SET fecha = ?, horaInicio = ?, horaFinal = ?
            WHERE idHorario = ?
        `;

        try {
            return await dbService.query(query, [fecha, horaInicio, horaFinal, idhorario]);
        } catch (err) {
            throw new Error(`Error al editar el horario: ${err.message}`);
        }
    }
}

module.exports = EditarHorarioModelo;