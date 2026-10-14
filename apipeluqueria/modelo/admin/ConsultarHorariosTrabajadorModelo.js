const dbService = require('../bd/Conexion');

class ConsultarHorariosAdminModelo {

    // Consultar horarios de un trabajador específico
    static async consultarHorariosTrabajador(idtrabajador) {

        const query = `
            SELECT 
                h.idhorario,
                rh.idtrabajador,
                t.nombres AS trabajador,
                h.fecha,
                h.horaInicio,
                h.horaFinal AS horaFinal,
                rh.estado
            FROM reghorarios rh
            INNER JOIN horarios h
                ON rh.idhorario = h.idhorario
            INNER JOIN trabajadores t 
                ON rh.idtrabajador = t.idTrabajador
            WHERE rh.idTrabajador = ?
            ORDER BY h.fecha, h.idHorario
        `;

        try {
            return await dbService.query(query, [idtrabajador]);
        } catch (err) {
            throw new Error(`Error al consultar los horarios del trabajador: ${err.message}`);
        }
    }
}

module.exports = ConsultarHorariosAdminModelo;