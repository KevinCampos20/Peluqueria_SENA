/*
El cliente desactiva su propia cuenta.
PUT /usuario/desactivar/:idcliente
*/
const modelo = require('../../modelo/clientes/EstadoClienteModelo');

class DesactivarClienteControlador {

    static async desactivarCuenta(req, res) {

        const { idcliente } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idcliente)) {
            return res.status(400).json({ error: 'El id del cliente no es válido.' });
        }

        try {
            // 2. El cliente debe existir
            const cliente = await modelo.buscarPorId(idcliente);

            if (!cliente) {
                return res.status(404).json({ error: 'No se encontró ningún cliente con esos datos.' });
            }

            // 3. No se repite el mismo estado
            if (cliente.estado === 'Inactivo') {
                return res.status(409).json({ error: 'La cuenta ya se encuentra inactiva.' });
            }

            // 4. Desactivar
            await modelo.cambiarEstado(idcliente, 'Inactivo');

            return res.json({ mensaje: 'Cuenta desactivada correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible desactivar la cuenta. Intente nuevamente.' });
        }
    }
}

module.exports = DesactivarClienteControlador;