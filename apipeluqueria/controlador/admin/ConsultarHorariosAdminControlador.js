const modelo = require('../../modelo/admin/ConsultarHorariosAdminModelo')

class ConsultarHorariosAdminControlador {

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
}

module.exports = ConsultarHorariosAdminControlador;