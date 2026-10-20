const dbService = require('../bd/Conexion');

// Estados de los horarios en la BD: 'Activo' = disponible, 'Inactivo' = reservado
const HORARIO_DISPONIBLE = 'Activo';
const HORARIO_RESERVADO = 'Inactivo';

class ReprogramarCitaModelo {

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

    // Busca el nuevo horario
    static async buscarHorario(idhorario) {

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

    // Revisa que los dos horarios sean del mismo trabajador (tabla reghorarios)
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
            const resultado = await dbService.query(query, [idhorarioA, idhorarioB]);
            return resultado[0].total > 0;
        } catch (err) {
            throw new Error(`Error al comparar los trabajadores de los horarios: ${err.message}`);
        }
    }

    // Cuenta las citas activas que ya tiene un horario
    static async contarCitasActivas(idhorario) {

        const query = `
            SELECT COUNT(*) AS total
            FROM citas
            WHERE idHorario = ?
              AND estado = 'Activa'
        `;

        try {
            const resultado = await dbService.query(query, [idhorario]);
            return resultado[0].total;
        } catch (err) {
            throw new Error(`Error al consultar las citas del horario: ${err.message}`);
        }
    }

    // Reprograma en una transacción: reserva el nuevo horario, mueve la cita y libera el anterior.
    // Devuelve false si el nuevo horario fue reservado por otra persona justo antes.
    static async reprogramarCita(idcita, idhorarioViejo, idhorarioNuevo) {

        try {
            return await dbService.transaccion(async (q) => {

                // Reserva solo si sigue disponible (evita que dos clientes tomen el mismo horario)
                const reserva = await q(
                    'UPDATE horarios SET estado = ? WHERE idHorario = ? AND estado = ?',
                    [HORARIO_RESERVADO, idhorarioNuevo, HORARIO_DISPONIBLE]
                );

                if (reserva.affectedRows === 0) {
                    return false;
                }

                await q('UPDATE reghorarios SET estado = ? WHERE idHorario = ?', [HORARIO_RESERVADO, idhorarioNuevo]);
                await q('UPDATE citas SET idHorario = ? WHERE idCita = ?', [idhorarioNuevo, idcita]);
                await q('UPDATE horarios SET estado = ? WHERE idHorario = ?', [HORARIO_DISPONIBLE, idhorarioViejo]);
                await q('UPDATE reghorarios SET estado = ? WHERE idHorario = ?', [HORARIO_DISPONIBLE, idhorarioViejo]);

                return true;
            });
        } catch (err) {
            throw new Error(`Error al reprogramar la cita: ${err.message}`);
        }
    }
}

module.exports = ReprogramarCitaModelo;