const modelo = require('../../modelo/Trabajadores/ConsultarHorariosTrabajadorModelo')

class ConsultarHorariosTrabajadorControlador {

    static async consultarHorarios(req, res) {

        try {
            const { idtrabajador } = req.params;
            
            const horarios = await modelo.consultarHorarios();

            res.json({
                mensaje: 'Horarios consultados correctamente',
                horarios: horarios
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }
    }
}

module.exports = ConsultarHorariosTrabajadorControlador;