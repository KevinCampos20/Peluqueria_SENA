/*
RF-14: El administrador elimina un cliente.
*/
const modelo = require('../../modelo/admin/EliminarClienteAdminModelo');

class EliminarClienteAdminControlador {

    static async eliminarCliente(req, res) {

        const { idcliente } = req.params;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idcliente)) {
            return res.status(400).json({ error: 'El id del cliente no es válido.' });
        }

        try {
            // 2. El cliente debe existir (A1 / CA-03)
            const cliente = await modelo.buscarPorId(idcliente);

            if (!cliente) {
                return res.status(404).json({ error: 'No se encontró ningún cliente con esos datos.' });
            }

            // 3. Eliminar (CA-06)
            await modelo.eliminarCliente(idcliente);

            return res.json({ mensaje: 'El cliente fue eliminado correctamente.' });

        } catch (err) {
            // A4 / CA-10: error técnico, el cliente no se elimina
            console.error(err.message);
            return res.status(500).json({ error: 'No se pudo eliminar el cliente. Intente nuevamente.' });
        }
    }
}

module.exports = EliminarClienteAdminControlador;