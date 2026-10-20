const dbService = require('../bd/Conexion');

// Estados de los horarios en la BD: 'Activo' = disponible, 'Inactivo' = reservado
const HORARIO_DISPONIBLE = 'Activo';

class CancelarCitaModelo {

    // Busca la cita junto con los datos de su horario
    static async buscarCita(idcita) {

        const query = `
            SELECT c.idCita, c.idCliente, c.idHorario, c.estado,
                   h.fecha, h.horaInicio, h.horaFinal
            FROM citas c
            INNER JOIN horarios h
                ON h.idHorario = c.idHorario
            WHERE c.idCita = ?
        `;

        try {
            const resultado = await dbService.query(query, [idcita]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar la cita: ${err.message}`);
        }
    }

    // Cancela la cita y libera el horario (en horarios y reghorarios) en una sola sentencia
    static async cancelarCita(idcita) {

        const query = `
            UPDATE citas c
            INNER JOIN horarios h
                ON h.idHorario = c.idHorario
            LEFT JOIN reghorarios rh
                ON rh.idHorario = h.idHorario
            SET c.estado = 'Cancelada',
                h.estado = ?,
                rh.estado = ?
            WHERE c.idCita = ?
        `;

        try {
            return await dbService.query(query, [HORARIO_DISPONIBLE, HORARIO_DISPONIBLE, idcita]);
        } catch (err) {
            throw new Error(`Error al cancelar la cita: ${err.message}`);
        }
    }
}

module.exports = CancelarCitaModelo;