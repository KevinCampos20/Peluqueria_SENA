const modelo = require('../../modelo/admin/ActivarClienteModelo');

class ActivarClienteControlador {

    static async modificarestado(req, res) {
        const { id } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({ error: 'El id del cliente no es válido.' });
        }

        try {
            // 2. Cambiar el estado
            const resultado = await modelo.modificarEstado(id);

            // 3. Si no se afectó ninguna fila, el cliente no existe
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'No se encontró ningún cliente con ese id.' });
            }

            // 4. Éxito (200, porque es un PUT que actualiza)
            return res.json({ mensaje: 'Cliente activado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible activar el cliente. Intente nuevamente.' });
        }
    }
}

module.exports = ActivarClienteControlador;