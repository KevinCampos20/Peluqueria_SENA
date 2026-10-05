const dbService = require('../bd/Conexion');

class CancelarCitaModelo {

    static async buscarPorId(idcita) {
        const query = `
            SELECT idcita, idcliente, idhorario, estado
            FROM citas
            WHERE idcita = ?
        `;
        try {
            const resultado = await dbService.query(query, [idcita]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar la cita: ${err.message}`);
        }
    }

    static async cancelarCita(idcita, idhorario) {
        try {
            // La cita pasa a CANCELADA
            await dbService.query(
                `UPDATE citas SET estado = 'CANCELADA' WHERE idcita = ?`,
                [idcita]
            );
            // El horario vuelve a quedar libre
            await dbService.query(
                `UPDATE horarios SET estado = 'DISPONIBLE' WHERE idhorario = ?`,
                [idhorario]
            );
        } catch (err) {
            throw new Error(`Error al cancelar la cita: ${err.message}`);
        }
    }
}

module.exports = CancelarCitaModelo;