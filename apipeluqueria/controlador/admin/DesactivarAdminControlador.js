const modelo = require('../../modelo/admin/DesactivarAdminModelo');

class DesactivarAdminControlador {
    static async modificarestado(req, res) {
        const { id } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'El id del administrador no es válido.' });
        }

        try {
            // 2. Debe existir y ser administrador
            const admin = await modelo.buscarAdmin(id);

            if (!admin) {
                return res.status(404).json({ error: 'No se encontró ningún administrador con ese id.' });
            }

            // 3. Si está activo, debe quedar al menos otro administrador activo
            if (admin.estado === 'Activo') {
                const otrosActivos = await modelo.contarOtrosAdminsActivos(id);

                if (otrosActivos === 0) {
                    return res.status(409).json({
                        error: 'No se puede desactivar: debe quedar al menos un administrador activo en el sistema.'
                    });
                }
            }

            // 4. Desactivar
            await modelo.modificarEstado(id);

            return res.json({ mensaje: 'Administrador desactivado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible desactivar el administrador. Intente nuevamente.' });
        }
    }
}

module.exports = DesactivarAdminControlador;