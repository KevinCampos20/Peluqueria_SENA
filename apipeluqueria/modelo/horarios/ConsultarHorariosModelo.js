const dbService = require('../bd/Conexion');

class ConsultarHorariosModelo {

    static async consultarHorarios() {

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
            WHERE h.estado = 'DISPONIBLE'
        `;

        try {
            const resultado = await dbService.query(query);
            return resultado;
        } catch (err) {
            throw new Error(`Error al consultar los horarios: ${err.message}`);
        }
    }
}

module.exports = ConsultarHorariosModelo;