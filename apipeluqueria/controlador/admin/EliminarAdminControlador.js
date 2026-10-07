/*
RF-25: El administrador elimina a otro administrador.
*/
const modelo = require('../../modelo/admin/EliminarAdminModelo');

class EliminarAdminControlador {

    static async eliminarAdmin(req, res) {

        const { idadmin } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idadmin)) {
            return res.status(400).json({ error: 'El id del administrador no es válido.' });
        }

        try {
            // 2. El administrador debe existir
            const admin = await modelo.buscarPorId(idadmin);

            if (!admin) {
                return res.status(404).json({ error: 'El administrador no existe o ya fue eliminado.' });
            }

            // 3. Solo se eliminan administradores, no trabajadores
            if (String(admin.rol).toLowerCase() !== 'admin') {
                return res.status(403).json({ error: 'El usuario indicado no es un administrador. Use la opción de eliminar trabajador.' });
            }

            // 4. Debe quedar al menos otro administrador activo en el sistema
            const otrosActivos = await modelo.contarOtrosAdminsActivos(idadmin);

            if (otrosActivos === 0) {
                return res.status(409).json({
                    error: 'No se puede eliminar: debe quedar al menos un administrador activo en el sistema.'
                });
            }

            // 5. No se elimina si tiene horarios registrados
            const totalHorarios = await modelo.contarHorarios(idadmin);

            if (totalHorarios > 0) {
                return res.status(409).json({
                    error: 'El administrador tiene horarios registrados. Elimine primero sus horarios.'
                });
            }

            // 6. Eliminar
            await modelo.eliminarAdmin(idadmin);

            return res.json({ mensaje: 'Administrador eliminado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible eliminar el administrador. Intente nuevamente.' });
        }
    }
}

module.exports = EliminarAdminControlador;