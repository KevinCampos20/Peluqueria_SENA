function aMinutos(hora) {
    const texto = String(hora ?? '').trim().toLowerCase();

    // Formato de 24 horas: 15:00 o 15:00:00
    let partes = texto.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::00)?$/);

    if (partes) {
        return Number(partes[1]) * 60 + Number(partes[2]);
    }

    // Formato de 12 horas: 3:00 pm, 7:00 am, 12:00 m
    partes = texto.match(
        /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm|m)$/
    );

    if (!partes) {
        return null;
    }

    const hora12 = Number(partes[1]);
    const minutos = Number(partes[2]);
    const periodo = partes[3];

    if (periodo === 'm') {
        return hora12 === 12 && minutos === 0 ? 720 : null;
    }

    let hora24 = hora12 % 12;

    if (periodo === 'pm') {
        hora24 += 12;
    }

    return hora24 * 60 + minutos;
}

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
                    `SELECT rh.idRegHorario, h.fecha, h.horaInicio, h.horaFinal
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

                // Validar las reglas del horario de la peluquería.
                const horario = asignaciones[0];
                const inicio = aMinutos(horario.horaInicio);
                const final = aMinutos(horario.horaFinal);

                if (inicio === null || final === null || inicio >= final) {
                    const error = new Error('El horario tiene horas inválidas.');
                    error.codigo = 'HORARIO_INVALIDO';
                    throw error;
                }

                const APERTURA = 7 * 60;
                const ULTIMA_CITA = 20 * 60;
                const CIERRE = 21 * 60;

                if (inicio < APERTURA || inicio > ULTIMA_CITA || final > CIERRE) {
                    const error = new Error(
                        'El horario debe estar entre las 7:00 a. m. y las 9:00 p. m., y comenzar como máximo a las 8:00 p. m.'
                    );
                    error.codigo = 'HORARIO_FUERA_DE_JORNADA';
                    throw error;
                }

                const INICIO_ALMUERZO = 12 * 60;
                const FIN_ALMUERZO = 13 * 60;

                if (inicio < FIN_ALMUERZO && final > INICIO_ALMUERZO) {
                    const error = new Error(
                        'No se permiten citas durante el almuerzo, de 12:00 m. a 1:00 p. m.'
                    );
                    error.codigo = 'HORARIO_ALMUERZO';
                    throw error;
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