const modelo = require('../../modelo/Trabajadores/ConsultarHorariosTrabajadorModelo')

class ConsultarHorariosTrabajadorControlador {

    static async consultarHorarios(req, res) {

        try {
            const { idtrabajador } = req.params;

            if (!/^\d+$/.test(idtrabajador)) {
                return res.status(400).json({ error: 'El id del trabajador debe ser numérico' });
            }
            
            const horarios = await modelo.consultarHorarios(idtrabajador);

            if (horarios.length === 0) {
                return res.json({
                    mensaje: 'No tiene un horario asignado actualmente.',
                    horarios: []
                });
            }

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