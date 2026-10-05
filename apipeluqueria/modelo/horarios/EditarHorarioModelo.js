const dbService = require('../bd/Conexion');

class EditarHorarioModelo {

    static async buscarPorId(idhorario) {

        const query = `
            SELECT idhorario, idtrabajador, estado
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

    static async existeTraslape(idtrabajador, fecha, horaInicio, horaFin, idhorario) {

        const query = `
            SELECT idhorario
            FROM horarios
            WHERE idtrabajador = ?
              AND fecha = ?
              AND idhorario <> ?
              AND horaInicio < ?
              AND horaFin > ?
            LIMIT 1
        `;

        try {
            const resultado = await dbService.query(query, [
                idtrabajador,
                fecha,
                idhorario,
                horaFin,
                horaInicio
            ]);
            return resultado.length > 0;
        } catch (err) {
            throw new Error(`Error al validar traslape: ${err.message}`);
        }
    }

    static async editarHorario(idhorario, fecha, horaInicio, horaFin) {

        const query = `
            UPDATE horarios
            SET fecha = ?,
                horaInicio = ?,
                horaFin = ?
            WHERE idhorario = ?
        `;

        try {

            const resultado = await dbService.query(query, [
                fecha,
                horaInicio,
                horaFin,
                idhorario
            ]);

            return resultado;

        } catch (err) {

            throw new Error(`Error al editar el horario: ${err.message}`);

        }
    }
}

module.exports = EditarHorarioModelo;