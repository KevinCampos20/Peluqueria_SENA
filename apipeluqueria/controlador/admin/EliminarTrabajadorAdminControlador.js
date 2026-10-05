/*
RF-13: El administrador elimina un trabajador.
*/
const modelo = require('../../modelo/admin/EliminarTrabajadorAdminModelo');

class EliminarTrabajadorAdminControlador {

    static async eliminarTrabajador(req, res) {

        const { idtrabajador } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idtrabajador)) {
            return res.status(400).json({ error: 'El id del trabajador no es válido.' });
        }

        try {
            // 2. El trabajador debe existir
            const trabajador = await modelo.buscarPorId(idtrabajador);

            if (!trabajador) {
                return res.status(404).json({ error: 'El trabajador no existe o ya fue eliminado.' });
            }

            // 3. Solo se eliminan trabajadores, no administradores
            if (String(trabajador.rol).toLowerCase() !== 'trabajador') {
                return res.status(403).json({ error: 'No se puede eliminar a un administrador desde esta opción.' });
            }

            // 4. No se elimina si todavía tiene horarios registrados
            const totalHorarios = await modelo.contarHorarios(idtrabajador);

            if (totalHorarios > 0) {
                return res.status(409).json({
                    error: 'El trabajador tiene horarios registrados. Elimine primero sus horarios.'
                });
            }

            // 5. Eliminar
            await modelo.eliminarTrabajador(idtrabajador);

            return res.json({ mensaje: 'Trabajador eliminado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible eliminar el trabajador. Intente nuevamente.' });
        }
    }
}

module.exports = EliminarTrabajadorAdminControlador;