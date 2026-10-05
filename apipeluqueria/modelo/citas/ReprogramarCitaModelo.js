const dbService = require('../bd/Conexion');

class ReprogramarCitaModelo {

    static async buscarCita(idcita) {
        const query = `
            SELECT c.idcita, c.idcliente, c.idhorario, c.estado, h.idtrabajador
            FROM citas c
            JOIN horarios h ON h.idhorario = c.idhorario
            WHERE c.idcita = ?
        `;
        try {
            const resultado = await dbService.query(query, [idcita]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar la cita: ${err.message}`);
        }
    }

    static async buscarHorario(idhorario) {
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

    static async reprogramarCita(idcita, idhorarioAnterior, idhorarioNuevo) {
        try {
            // 1. El horario nuevo queda ocupado
            await dbService.query(
                `UPDATE horarios SET estado = 'RESERVADO' WHERE idhorario = ?`,
                [idhorarioNuevo]
            );
            // 2. La cita pasa al horario nuevo
            await dbService.query(
                `UPDATE citas SET idhorario = ? WHERE idcita = ?`,
                [idhorarioNuevo, idcita]
            );
            // 3. El horario anterior queda libre
            await dbService.query(
                `UPDATE horarios SET estado = 'DISPONIBLE' WHERE idhorario = ?`,
                [idhorarioAnterior]
            );
        } catch (err) {
            throw new Error(`Error al reprogramar la cita: ${err.message}`);
        }
    }
}

module.exports = ReprogramarCitaModelo;