const dbService = require('../bd/Conexion');

const HORARIO_DISPONIBLE = 'Activo';
const HORARIO_RESERVADO = 'Inactivo';

class CrearCitaModelo {
    // RF: crear una cita y reservar el horario en una sola transacción.
    static async crear(idCliente, idTrabajador, idHorario) {
        try {
            return await dbService.transaccion(async (q) => {
                // El cliente debe existir y estar activo.
                const clientes = await q(
                    `SELECT idCliente
                     FROM clientes
                     WHERE idCliente = ? AND estado = 'Activo'`,
                    [idCliente]
                );

                if (clientes.length === 0) {
                    const error = new Error('El cliente no existe o está inactivo.');
                    error.codigo = 'CLIENTE_NO_DISPONIBLE';
                    throw error;
                }

                // El horario debe estar asignado a ese trabajador y disponible.
                const asignaciones = await q(
                    `SELECT rh.idRegHorario
                     FROM reghorarios rh
                     INNER JOIN horarios h ON h.idHorario = rh.idHorario
                     INNER JOIN trabajadores t ON t.idTrabajador = rh.idTrabajador
                     WHERE rh.idHorario = ?
                       AND rh.idTrabajador = ?
                       AND rh.estado = ?
                       AND h.estado = ?
                       AND t.estado = 'Activo'
                     FOR UPDATE`,
                    [idHorario, idTrabajador, HORARIO_DISPONIBLE, HORARIO_DISPONIBLE]
                );

                if (asignaciones.length === 0) {
                    return null;
                }

                // Reservar el horario solo si todavía está disponible.
                const reservaHorario = await q(
                    `UPDATE horarios
                     SET estado = ?
                     WHERE idHorario = ? AND estado = ?`,
                    [HORARIO_RESERVADO, idHorario, HORARIO_DISPONIBLE]
                );

                if (reservaHorario.affectedRows === 0) {
                    return null;
                }

                // Marcar como reservado el registro del trabajador para ese horario.
                const reservaTrabajador = await q(
                    `UPDATE reghorarios
                     SET estado = ?
                     WHERE idHorario = ?
                       AND idTrabajador = ?
                       AND estado = ?`,
                    [HORARIO_RESERVADO, idHorario, idTrabajador, HORARIO_DISPONIBLE]
                );

                if (reservaTrabajador.affectedRows === 0) {
                    const error = new Error('El horario ya no está disponible.');
                    error.codigo = 'HORARIO_NO_DISPONIBLE';
                    throw error;
                }

                const resultado = await q(
                    `INSERT INTO citas (idCliente, idHorario, estado)
                     VALUES (?, ?, 'Activa')`,
                    [idCliente, idHorario]
                );

                return resultado.insertId;
            });
        } catch (err) {
            if (err.codigo) throw err;
            throw new Error(`Error al crear la cita: ${err.message}`);
        }
    }
}

module.exports = CrearCitaModelo;
