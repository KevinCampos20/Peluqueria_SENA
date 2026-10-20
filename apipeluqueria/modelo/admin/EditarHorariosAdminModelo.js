const dbService = require('../bd/Conexion');

class EditarHorariosAdminModelo {

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

    // Trae los otros horarios del mismo trabajador (dueño del horario) en esa fecha
    static async buscarHorariosDelDia(idhorario, fecha) {

        const query = `
            SELECT DISTINCT h2.idHorario, h2.horaInicio, h2.horaFinal
            FROM reghorarios rh1
            INNER JOIN reghorarios rh2
                ON rh2.idTrabajador = rh1.idTrabajador
               AND rh2.idHorario <> rh1.idHorario
            INNER JOIN horarios h2
                ON h2.idHorario = rh2.idHorario
            WHERE rh1.idHorario = ?
              AND h2.fecha = ?
        `;

        try {
            return await dbService.query(query, [idhorario, fecha]);
        } catch (err) {
            throw new Error(`Error al consultar los horarios del día: ${err.message}`);
        }
    }

    // Actualiza fecha, horas y (si viene) el estado, también en reghorarios para que no se desfasen
    static async editarHorario(idhorario, fecha, horaInicio, horaFinal, estado) {

        const query = `
            UPDATE horarios h
            LEFT JOIN reghorarios rh
                ON rh.idHorario = h.idHorario
            SET h.fecha = ?,
                h.horaInicio = ?,
                h.horaFinal = ?,
                h.estado = COALESCE(?, h.estado),
                rh.estado = COALESCE(?, rh.estado)
            WHERE h.idHorario = ?
        `;

        try {
            return await dbService.query(query, [fecha, horaInicio, horaFinal, estado, estado, idhorario]);
        } catch (err) {
            throw new Error(`Error al editar el horario: ${err.message}`);
        }
    }
}

module.exports = EditarHorariosAdminModelo;