const modelo = require('../../modelo/admin/ConsultarHorariosTrabajadorModelo');

class ConsultarHorariosAdminControlador {

    // Consultar todos los horarios
    static async consultarHorarios(req, res) {

        try {

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


    // Consultar horarios de un trabajador específico
    static async consultarHorariosTrabajador(req, res) {

        const { idtrabajador } = req.params;

        try {

            const horarios = await modelo.consultarHorariosTrabajador(idtrabajador);

            res.json({
                mensaje: 'Horarios del trabajador consultados correctamente',
                horarios: horarios
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }
    }
}

module.exports = ConsultarHorariosAdminControlador;