//const dbService = require('../db/clientes/LoginClienteModelo/Conexion');
const dbService = require('../bd/Conexion');

class VerHorarioModelo {
    // Buscar todo
    static async buscaTodoDia(idTrabajador, fechaConsulta = null) {
        const fecha = fechaConsulta || new Date().toISOString().split('T')[0];
        const query = `
        SELECT 
            t.nombres AS nombresTrabajador,
            h.fecha,
            h.horaInicio,
            h.horaFinal,
            rh.estado AS estadoRegistro
        FROM reghorarios rh
        INNER JOIN trabajadores t ON rh.idTrabajador = t.idtrabajador
        INNER JOIN horarios h ON rh.idHorario = h.idHorario
        WHERE h.fecha = ? 
          AND rh.idTrabajador = ?
       `;
        try {
            const resultado = await dbService.query(query, [fecha, idTrabajador]);
            return resultado.length > 0 ? resultado : [];
        } catch (err) {
            throw new Error(`Error al buscar el horario: ${err.message}`);
        }
    }

    static async buscarEstado(idTrabajador, fechaConsulta = null, est) {
        const fecha = fechaConsulta || new Date().toISOString().split('T')[0];
        if (est == 'A') {
            est = 'Activo';
        }
        else {
            est = 'Inactivo';
        }
        const query = `
        SELECT 
            t.nombres AS nombresTrabajador,
            h.fecha,
            h.horaInicio,
            h.horaFinal,
            rh.estado AS estadoRegistro
        FROM reghorarios rh
        INNER JOIN trabajadores t ON rh.idTrabajador = t.idtrabajador
        INNER JOIN horarios h ON rh.idHorario = h.idHorario
        WHERE h.fecha = ? 
          AND rh.idTrabajador = ?
          AND rh.estado
       `;
        try {
            const resultado = await dbService.query(query, [fecha, idTrabajador, est]);
            return resultado.length > 0 ? resultado : [];
        } catch (err) {
            throw new Error(`Error al buscar el horario por estado: ${err.message}`);
        }
    }
     static async buscarTodo(id, pag = 1, limit = 50) {
        const paginaActual = Math.max(1, parseInt(pag));
        const rPagina = Math.max(1, parseInt(limit));
        const op = (paginaActual -1) * rPagina;
        const fecha = fechaConsulta || new Date().toISOString().split('T')[0];
        const query = `
        SELECT 
            t.nombres AS nombresTrabajador,
            h.fecha,
            h.horaInicio,
            h.horaFinal,
            rh.estado AS estadoRegistro
        FROM reghorarios rh
        INNER JOIN trabajadores t ON rh.idTrabajador = t.idTrabajador
        INNER JOIN horarios h ON rh.idHorario = h.idHorario
        WHERE idTrabajador=?
        LIMIT ? OFFSET ?
       `;
        try {
            const resultado = await dbService.query(query, [limit, pag, id]);
            return resultado.length > 0 ? resultado : [];
        } catch (err) {
            throw new Error(`Error al buscar el horario por estado: ${err.message}`);
        }
    }
}

module.exports = VerHorarioModelo;