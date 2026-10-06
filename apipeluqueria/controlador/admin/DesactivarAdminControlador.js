const modelo = require('../../modelo/admin/DesactivarAdminModelo');

class DesactivarAdminControlador {
    static async modificarestado(req, res) {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'El id del administrador no es válido.' });
        }

        try {
            const resultado = await modelo.modificarEstado(id);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'No se encontró ningún administrador con ese id.' });
            }

            return res.json({ mensaje: 'Administrador desactivado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible desactivar el administrador. Intente nuevamente.' });
        }
    }
}

module.exports = DesactivarAdminControlador;