const dbService = require('../bd/Conexion');

class EliminarHorarioModelo {

    static async eliminarHorario(idhorario) {

        const query = `
            DELETE FROM horarios
            WHERE idhorario = ?
        `;

        try {

            const resultado = await dbService.query(query, [
                idhorario
            ]);

            return resultado;

        } catch (err) {

            throw new Error(`Error al eliminar el horario: ${err.message}`);

        }
    }
}

module.exports = EliminarHorarioModelo;