const dbService = require('../bd/Conexion');

class ConsultarHorariosTrabajadorModelo {

    static async consultarHorarios(idtrabajador) {

        const query = `
            SELECT 
                h.idhorario,
                h.idtrabajador,
                t.nombres AS trabajador,
                h.fecha,
                h.horaInicio,
                h.horaFin,
                h.estado
            FROM horarios h
            INNER JOIN trabajadores t 
                ON h.idtrabajador = t.idtrabajador
               WHERE h.idtrabajador = ?
               ORDER BY h.fecha, h.horaInicio
        `;

        try {
            const resultado = await dbService.query(query, [idtrabajador]);
            return resultado;
        } catch (err) {
            throw new Error(`Error al consultar los horarios: ${err.message}`);
        }
    }
}

module.exports = ConsultarHorariosTrabajadorModelo;