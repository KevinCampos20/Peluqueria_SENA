const modelo = require('../../modelo/admin/DesactivarTrabajadorModelo');

class DesactivarTrabajadorControlador {

    static async modificarestado(req, res) {
        const { id } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'El id del trabajador no es válido.' });
        }

        try {
            // 2. Cambiar el estado
            const resultado = await modelo.modificarEstado(id);

            // 3. Si no se afectó ninguna fila, el trabajador no existe
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'No se encontró ningún trabajador con ese id.' });
            }

            return res.json({ mensaje: 'Trabajador desactivado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible desactivar el trabajador. Intente nuevamente.' });
        }
    }
}

module.exports = DesactivarTrabajadorControlador;