const modelo = require('../../modelo/trabajadores/VerHorarioModelo');
class VerHorarioControlador {
    obtenerHorarioDia = async (req, res) => {
        const { id, fecha } = req.params;
        const horario = await modelo.buscaTodoDia(id, fecha);
        res.status(200).json({
            exito: true,
            mensaje: 'Horarios obtenidos correctamente',
            datos: horario
        });

    }

    obtenerHorarioEstado = async (req, res) => {
        const { id, fecha, est } = req.params;
        const horario = await modelo.buscarEstado(id, fecha, est);
        res.status(200).json({
            exito: true,
            mensaje: 'Estado del Horario obtenido correctamente',
            datos: horario
        });

    }

    buscarTodo = async (req, res) => {
        const { id } = req.params;
        const horario = await modelo.buscarTodo(id);
        res.status(200).json({
            exito: true,
            mensaje: 'Todos los datos obtenidos correctamente',
            datos: horario
        });

    }
}
module.exports = new VerHorarioControlador;