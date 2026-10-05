/*
RF-12: El administrador elimina un horario.
*/
const modelo = require('../../modelo/admin/EliminarHorariosAdminModelo');

class EliminarHorariosAdminControlador {

    static async eliminarHorario(req, res) {

        const { idhorario } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idhorario)) {
            return res.status(400).json({ error: 'El id del horario no es válido.' });
        }

        try {
            // 2. El horario debe existir
            const horario = await modelo.buscarPorId(idhorario);

            if (!horario) {
                return res.status(404).json({ error: 'El horario no está disponible o ya fue eliminado.' });
            }

            // 3. Eliminar
            await modelo.eliminarHorario(idhorario);

            return res.json({ mensaje: 'Horario eliminado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible eliminar el horario. Intente nuevamente.' });
        }
    }
}

module.exports = EliminarHorariosAdminControlador;