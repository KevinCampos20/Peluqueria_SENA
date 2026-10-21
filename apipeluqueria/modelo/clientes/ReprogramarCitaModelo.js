
const dbService = require('../bd/Conexion');

const HORARIO_DISPONIBLE = 'Activo';
const HORARIO_RESERVADO = 'Inactivo';
const CITA_ACTIVA = 'Activa';

// Convierte formatos de 24 horas y 12 horas a minutos.
function aMinutos(hora) {
    const texto = String(hora ?? '').trim().toLowerCase();

    let partes = texto.match(
        /^([01]?\d|2[0-3]):([0-5]\d)(?::00)?$/
    );

    if (partes) {
        return Number(partes[1]) * 60 + Number(partes[2]);
    }

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

// Convierte fecha y hora de Bogotá a un instante comparable.
// La peluquería se encuentra en Colombia (UTC-5, sin horario de verano).
function instanteCita(fecha, hora) {
    const fechaTexto = String(fecha ?? '').slice(0, 10);
    const partesFecha = fechaTexto.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    const minutos = aMinutos(hora);

    if (!partesFecha || minutos === null) {
        return null;
    }

    const anio = Number(partesFecha[1]);
    const mes = Number(partesFecha[2]);
    const dia = Number(partesFecha[3]);

    const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));

    // Evitar aceptar fechas inexistentes, como 2026-02-31.
    if (
        fechaUTC.getUTCFullYear() !== anio ||
        fechaUTC.getUTCMonth() !== mes - 1 ||
        fechaUTC.getUTCDate() !== dia
    ) {
        return null;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    // Bogotá está cinco horas detrás de UTC.
    return Date.UTC(
        anio,
        mes - 1,
        dia,
        horas + 5,
        minutosRestantes
    );
}

// Valida la jornada y el almuerzo.
function validarHorario(horario) {
    const inicio = aMinutos(horario.horaInicio);
    const final = aMinutos(horario.horaFinal);

    if (
        inicio === null ||
        final === null ||
        inicio >= final
    ) {
        const error = new Error(
            'El horario tiene horas inválidas.'
        );
        error.codigo = 'HORARIO_INVALIDO';
        throw error;
    }

    const APERTURA = 7 * 60;
    const ULTIMA_CITA = 20 * 60;
    const CIERRE = 21 * 60;

    if (
        inicio < APERTURA ||
        inicio > ULTIMA_CITA ||
        final > CIERRE
    ) {
        const error = new Error(
            'La jornada permitida es de 7:00 a. m. a 9:00 p. m. y la cita debe comenzar como máximo a las 8:00 p. m.'
        );
        error.codigo = 'HORARIO_FUERA_DE_JORNADA';
        throw error;
    }

    const INICIO_ALMUERZO = 12 * 60;
    const FIN_ALMUERZO = 13 * 60;

    if (
        inicio < FIN_ALMUERZO &&
        final > INICIO_ALMUERZO
    ) {
        const error = new Error(
            'No se permiten citas durante el almuerzo, de 12:00 m. a 1:00 p. m.'
        );
        error.codigo = 'HORARIO_ALMUERZO';
        throw error;
    }
}

class ReprogramarCitaModelo {

    // Busca la cita junto con los datos de su horario.
    static async buscarCita(idcita) {
        const query = `
            SELECT
                c.idCita,
                c.idCliente,
                c.idHorario,
                c.estado,
                DATE_FORMAT(h.fecha, '%Y-%m-%d') AS fecha,
                h.horaInicio,
                h.horaFinal
            FROM citas c
            INNER JOIN horarios h
                ON h.idHorario = c.idHorario
            WHERE c.idCita = ?
        `;

        try {
            const resultado = await dbService.query(
                query,
                [idcita]
            );

            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(
                `Error al buscar la cita: ${err.message}`
            );
        }
    }

    // Busca el nuevo horario.
    static async buscarHorario(idhorario) {
        const query = `
            SELECT
                idHorario,
                DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
                horaInicio,
                horaFinal,
                estado
            FROM horarios
            WHERE idHorario = ?
        `;

        try {
            const resultado = await dbService.query(
                query,
                [idhorario]
            );

            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(
                `Error al buscar el horario: ${err.message}`
            );
        }
    }

    // Comprueba si ambos horarios pertenecen a un mismo trabajador.
    static async mismoTrabajador(idhorarioA, idhorarioB) {
        const query = `
            SELECT COUNT(*) AS total
            FROM reghorarios a
            INNER JOIN reghorarios b
                ON a.idTrabajador = b.idTrabajador
            WHERE a.idHorario = ?
              AND b.idHorario = ?
        `;

        try {
            const resultado = await dbService.query(
                query,
                [idhorarioA, idhorarioB]
            );

            return Number(resultado[0].total) > 0;
        } catch (err) {
            throw new Error(
                `Error al comparar los trabajadores de los horarios: ${err.message}`
            );
        }
    }

    // Cuenta las citas activas de un horario.
    static async contarCitasActivas(idhorario) {
        const query = `
            SELECT COUNT(*) AS total
            FROM citas
            WHERE idHorario = ?
              AND estado = 'Activa'
        `;

        try {
            const resultado = await dbService.query(
                query,
                [idhorario]
            );

            return Number(resultado[0].total);
        } catch (err) {
            throw new Error(
                `Error al consultar las citas del horario: ${err.message}`
            );
        }
    }

    // Reprograma una cita de forma transaccional.
    static async reprogramarCita(
        idcita,
        idhorarioViejo,
        idhorarioNuevo
    ) {
        try {
            return await dbService.transaccion(async (q) => {

                // 1. No se permite reprogramar al mismo horario.
                if (Number(idhorarioViejo) === Number(idhorarioNuevo)) {
                    const error = new Error(
                        'Selecciona un horario diferente al actual.'
                    );
                    error.codigo = 'MISMO_HORARIO';
                    throw error;
                }

                // 2. Bloquear y consultar la cita actual.
                const citas = await q(
                    `SELECT
                        c.idCita,
                        c.idHorario,
                        c.estado,
                        DATE_FORMAT(h.fecha, '%Y-%m-%d') AS fecha,
                        h.horaInicio,
                        h.horaFinal
                     FROM citas c
                     INNER JOIN horarios h
                        ON h.idHorario = c.idHorario
                     WHERE c.idCita = ?
                     FOR UPDATE`,
                    [idcita]
                );

                if (citas.length === 0) {
                    const error = new Error(
                        'La cita no existe.'
                    );
                    error.codigo = 'CITA_NO_ENCONTRADA';
                    throw error;
                }

                const cita = citas[0];

                if (cita.estado !== CITA_ACTIVA) {
                    const error = new Error(
                        'Solo se pueden reprogramar citas activas.'
                    );
                    error.codigo = 'CITA_NO_ACTIVA';
                    throw error;
                }

                if (
                    Number(cita.idHorario) !== Number(idhorarioViejo)
                ) {
                    const error = new Error(
                        'El horario actual de la cita ha cambiado. Actualiza la información e inténtalo de nuevo.'
                    );
                    error.codigo = 'HORARIO_ACTUAL_CAMBIADO';
                    throw error;
                }

                // 3. Exigir al menos una hora de anticipación.
                const instanteActual = instanteCita(
                    cita.fecha,
                    cita.horaInicio
                );

                if (instanteActual === null) {
                    const error = new Error(
                        'No se pudo validar la fecha y hora de la cita actual.'
                    );
                    error.codigo = 'FECHA_HORA_INVALIDA';
                    throw error;
                }

                if (instanteActual - Date.now() < 60 * 60 * 1000) {
                    const error = new Error(
                        'La reprogramación debe realizarse con al menos una hora de anticipación.'
                    );
                    error.codigo = 'ANTICIPACION_INSUFICIENTE';
                    throw error;
                }

                // 4. Consultar y bloquear el nuevo horario.
                const horarios = await q(
                    `SELECT
                        idHorario,
                        DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
                        horaInicio,
                        horaFinal,
                        estado
                     FROM horarios
                     WHERE idHorario = ?
                     FOR UPDATE`,
                    [idhorarioNuevo]
                );

                if (horarios.length === 0) {
                    const error = new Error(
                        'El nuevo horario no existe.'
                    );
                    error.codigo = 'HORARIO_NO_ENCONTRADO';
                    throw error;
                }

                const nuevoHorario = horarios[0];

                if (nuevoHorario.estado !== HORARIO_DISPONIBLE) {
                    const error = new Error(
                        'El nuevo horario no está disponible.'
                    );
                    error.codigo = 'HORARIO_NO_DISPONIBLE';
                    throw error;
                }

                // 5. Validar jornada y almuerzo.
                validarHorario(nuevoHorario);

                // 6. No permitir reprogramar a una fecha pasada.
                const instanteNuevo = instanteCita(
                    nuevoHorario.fecha,
                    nuevoHorario.horaInicio
                );

                if (instanteNuevo === null) {
                    const error = new Error(
                        'La fecha o la hora del nuevo horario son inválidas.'
                    );
                    error.codigo = 'FECHA_HORA_INVALIDA';
                    throw error;
                }

                if (instanteNuevo <= Date.now()) {
                    const error = new Error(
                        'No puedes seleccionar un horario que ya pasó.'
                    );
                    error.codigo = 'HORARIO_PASADO';
                    throw error;
                }

                // 7. Comprobar que el nuevo horario pertenece
                // al mismo trabajador que el horario anterior.
                const trabajadores = await q(
                    `SELECT nuevo.idTrabajador
                     FROM reghorarios nuevo
                     INNER JOIN reghorarios anterior
                        ON anterior.idTrabajador = nuevo.idTrabajador
                     INNER JOIN trabajadores t
                        ON t.idTrabajador = nuevo.idTrabajador
                     WHERE nuevo.idHorario = ?
                       AND anterior.idHorario = ?
                       AND nuevo.estado = ?
                       AND t.estado = 'Activo'
                     LIMIT 1
                     FOR UPDATE`,
                    [
                        idhorarioNuevo,
                        idhorarioViejo,
                        HORARIO_DISPONIBLE
                    ]
                );

                if (trabajadores.length === 0) {
                    const error = new Error(
                        'El nuevo horario debe estar disponible con el mismo trabajador de la cita actual.'
                    );
                    error.codigo = 'TRABAJADOR_NO_COINCIDE';
                    throw error;
                }

                // 8. Reservar el nuevo horario.
                const reserva = await q(
                    `UPDATE horarios
                     SET estado = ?
                     WHERE idHorario = ?
                       AND estado = ?`,
                    [
                        HORARIO_RESERVADO,
                        idhorarioNuevo,
                        HORARIO_DISPONIBLE
                    ]
                );

                if (reserva.affectedRows === 0) {
                    const error = new Error(
                        'El nuevo horario acaba de ser reservado.'
                    );
                    error.codigo = 'HORARIO_NO_DISPONIBLE';
                    throw error;
                }

                // 9. Reservar la asignación del trabajador.
                const reservaTrabajador = await q(
                    `UPDATE reghorarios
                     SET estado = ?
                     WHERE idHorario = ?
                       AND idTrabajador = ?
                       AND estado = ?`,
                    [
                        HORARIO_RESERVADO,
                        idhorarioNuevo,
                        trabajadores[0].idTrabajador,
                        HORARIO_DISPONIBLE
                    ]
                );

                if (reservaTrabajador.affectedRows === 0) {
                    const error = new Error(
                        'La asignación del nuevo horario ya no está disponible.'
                    );
                    error.codigo = 'HORARIO_NO_DISPONIBLE';
                    throw error;
                }

                // 10. Mover únicamente la cita activa y sujeta al
                // horario anterior esperado.
                const actualizacionCita = await q(
                    `UPDATE citas
                     SET idHorario = ?
                     WHERE idCita = ?
                       AND idHorario = ?
                       AND estado = ?`,
                    [
                        idhorarioNuevo,
                        idcita,
                        idhorarioViejo,
                        CITA_ACTIVA
                    ]
                );

                if (actualizacionCita.affectedRows === 0) {
                    const error = new Error(
                        'No fue posible actualizar la cita.'
                    );
                    error.codigo = 'CITA_NO_ACTUALIZADA';
                    throw error;
                }

                // 11. Liberar el horario anterior después de mover la cita.
                await q(
                    `UPDATE horarios
                     SET estado = ?
                     WHERE idHorario = ?`,
                    [
                        HORARIO_DISPONIBLE,
                        idhorarioViejo
                    ]
                );

                await q(
                    `UPDATE reghorarios
                     SET estado = ?
                     WHERE idHorario = ?`,
                    [
                        HORARIO_DISPONIBLE,
                        idhorarioViejo
                    ]
                );

                return true;
            });
        } catch (err) {
            // Preservar los códigos de negocio para el controlador.
            if (err.codigo) {
                throw err;
            }

            throw new Error(
                `Error al reprogramar la cita: ${err.message}`
            );
        }
    }
}

module.exports = ReprogramarCitaModelo;