const dbService = require('../bd/Conexion');

const HORARIO_ACTIVO = 'Activo';

class EditarHorarioModelo {

    // Busca el horario para saber si existe.
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

    // Revisa si el horario pertenece al trabajador (tabla reghorarios).
    static async esDelTrabajador(idhorario, idtrabajador) {
        const query = `
            SELECT COUNT(*) AS total
            FROM reghorarios
            WHERE idHorario = ?
              AND idTrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idhorario, idtrabajador]);
            return Number(resultado[0].total) > 0;
        } catch (err) {
            throw new Error(`Error al validar el dueño del horario: ${err.message}`);
        }
    }

    // Trae los otros horarios del trabajador en esa fecha (sin contar el que se edita).
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

    // Actualiza fecha y horas. Dentro de una transacción vuelve a comprobar que el
    // horario exista y que no tenga una cita activa.
    static async editarHorario(idhorario, fecha, horaInicio, horaFinal) {
        try {
            return await dbService.transaccion(async (q) => {

                const horarios = await q(
                    `SELECT idHorario
                     FROM horarios
                     WHERE idHorario = ?
                     FOR UPDATE`,
                    [idhorario]
                );

                if (horarios.length === 0) {
                    const error = new Error('El horario no existe.');
                    error.codigo = 'HORARIO_NO_ENCONTRADO';
                    throw error;
                }

                const citas = await q(
                    `SELECT COUNT(*) AS total
                     FROM citas
                     WHERE idHorario = ?
                       AND estado = 'Activa'`,
                    [idhorario]
                );

                if (Number(citas[0].total) > 0) {
                    const error = new Error('El horario tiene una cita activa.');
                    error.codigo = 'HORARIO_CON_CITA_ACTIVA';
                    throw error;
                }

                const resultado = await q(
                    `UPDATE horarios
                     SET fecha = ?, horaInicio = ?, horaFinal = ?
                     WHERE idHorario = ?`,
                    [fecha, horaInicio, horaFinal, idhorario]
                );

                if (resultado.affectedRows === 0) {
                    const error = new Error('El horario no pudo actualizarse.');
                    error.codigo = 'HORARIO_NO_ACTUALIZADO';
                    throw error;
                }

                return resultado;
            });
        } catch (err) {
            if (err.codigo) throw err;
            throw new Error(`Error al editar el horario: ${err.message}`);
        }
    }
}

module.exports = EditarHorarioModelo;