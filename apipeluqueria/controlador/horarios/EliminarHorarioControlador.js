const modelo = require('../../modelo/horarios/EliminarHorarioModelo');

class EliminarHorarioControlador {

    static async eliminarHorario(req, res) {

        try {

            const { idhorario } = req.params;

            const resultado = await modelo.eliminarHorario(idhorario);

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: 'Horario no encontrado'
                });

            }

            res.json({
                mensaje: 'Horario eliminado correctamente'
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }
    }
}

module.exports = EliminarHorarioControlador;