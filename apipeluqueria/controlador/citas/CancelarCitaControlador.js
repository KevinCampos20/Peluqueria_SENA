/*
RF-15: El cliente cancela una cita.
*/
const modelo = require('../../modelo/citas/CancelarCitaModelo');

class CancelarCitaControlador {

    static async cancelarCita(req, res) {

        const { idcita } = req.params;
        const { idcliente } = req.body;

        // 1. Los ids deben ser numéricos
        if (!/^\d+$/.test(idcita)) {
            return res.status(400).json({ error: 'El id de la cita no es válido.' });
        }
        if (!/^\d+$/.test(String(idcliente))) {
            return res.status(400).json({ error: 'El id del cliente es obligatorio y debe ser numérico.' });
        }

        try {
            // 2. La cita debe existir
            const cita = await modelo.buscarPorId(idcita);

            if (!cita) {
                return res.status(404).json({ error: 'La cita no existe.' });
            }

            // 3. La cita debe ser del cliente
            if (cita.idcliente !== Number(idcliente)) {
                return res.status(403).json({ error: 'No puedes cancelar una cita de otro cliente.' });
            }

            // 4. La cita debe estar activa
            if (cita.estado !== 'ACTIVA') {
                return res.status(409).json({ error: 'La cita ya no está activa.' });
            }

            // 5. Cancelar
            await modelo.cancelarCita(idcita, cita.idhorario);

            return res.json({ mensaje: 'Cita cancelada correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible cancelar la cita. Intente nuevamente.' });
        }
    }
}

module.exports = CancelarCitaControlador;