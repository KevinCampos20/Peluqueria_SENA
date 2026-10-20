/*
RF-10: El trabajador elimina su horario.
*/
const modelo = require('../../modelo/trabajadores/EliminarHorarioModelo');

class EliminarHorarioControlador {

    static async eliminarHorario(req, res) {

        const { idhorario } = req.params;
        // El trabajador se envía por query (?idtrabajador=1) o por body, porque aún no hay token
        const idtrabajador = req.query.idtrabajador ?? (req.body || {}).idtrabajador;

        // 1. Los ids deben ser numéricos
        if (!/^\d+$/.test(idhorario)) {
            return res.status(400).json({ error: 'El id del horario no es válido.' });
        }

        if (!/^\d+$/.test(String(idtrabajador ?? ''))) {
            return res.status(400).json({ error: 'El id del trabajador es obligatorio y debe ser numérico.' });
        }

        try {
            // 2. El horario debe existir
            const horario = await modelo.buscarPorId(idhorario);

            if (!horario) {
                return res.status(404).json({ error: 'El horario seleccionado no existe o ya fue eliminado.' });
            }

            // 3. El trabajador solo elimina su propio horario
            const esSuyo = await modelo.esDelTrabajador(idhorario, idtrabajador);

            if (!esSuyo) {
                return res.status(403).json({ error: 'No tiene permisos para eliminar este horario.' });
            }

            // 4. No se elimina si tiene citas asociadas
            const totalCitas = await modelo.contarCitas(idhorario);

            if (totalCitas > 0) {
                return res.status(409).json({
                    error: 'El horario tiene citas registradas y no se puede eliminar.'
                });
            }

            // 5. Eliminar
            await modelo.eliminarHorario(idhorario);

            return res.json({ mensaje: 'Horario eliminado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible eliminar el horario. Intente nuevamente.' });
        }
    }
}

module.exports = EliminarHorarioControlador;