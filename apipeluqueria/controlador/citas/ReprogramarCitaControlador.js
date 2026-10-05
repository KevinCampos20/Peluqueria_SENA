/*
RF-16: El cliente reprograma una cita.
*/
const modelo = require('../../modelo/citas/ReprogramarCitaModelo');

class ReprogramarCitaControlador {

    static async reprogramarCita(req, res) {

        const { idcita } = req.params;
        const { idcliente, idhorario } = req.body;

        // 1. Los ids deben ser numéricos
        if (!/^\d+$/.test(idcita)) {
            return res.status(400).json({ error: 'El id de la cita no es válido.' });
        }
        if (!/^\d+$/.test(String(idcliente))) {
            return res.status(400).json({ error: 'El id del cliente es obligatorio y debe ser numérico.' });
        }
        if (!/^\d+$/.test(String(idhorario))) {
            return res.status(400).json({ error: 'El id del nuevo horario es obligatorio y debe ser numérico.' });
        }

        try {
            // 2. La cita debe existir
            const cita = await modelo.buscarCita(idcita);

            if (!cita) {
                return res.status(404).json({ error: 'La cita no existe.' });
            }

            // 3. La cita debe ser del cliente
            if (cita.idcliente !== Number(idcliente)) {
                return res.status(403).json({ error: 'No puedes reprogramar una cita de otro cliente.' });
            }

            // 4. La cita debe estar activa
            if (cita.estado !== 'ACTIVA') {
                return res.status(409).json({ error: 'La cita ya no está activa.' });
            }

            // 5. El horario nuevo debe ser distinto al actual
            if (cita.idhorario === Number(idhorario)) {
                return res.status(409).json({ error: 'La cita ya tiene ese horario.' });
            }

            // 6. El horario nuevo debe existir
            const horarioNuevo = await modelo.buscarHorario(idhorario);

            if (!horarioNuevo) {
                return res.status(404).json({ error: 'El horario no existe.' });
            }

            // 7. Debe ser del mismo trabajador de la cita
            if (horarioNuevo.idtrabajador !== cita.idtrabajador) {
                return res.status(409).json({ error: 'El nuevo horario debe ser del mismo trabajador de la cita.' });
            }

            // 8. Debe estar disponible
            if (horarioNuevo.estado !== 'DISPONIBLE') {
                return res.status(409).json({ error: 'El horario seleccionado no está disponible.' });
            }

            // 9. Reprogramar
            await modelo.reprogramarCita(idcita, cita.idhorario, idhorario);

            return res.json({ mensaje: 'Cita reprogramada correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible reprogramar la cita. Intente nuevamente.' });
        }
    }
}

module.exports = ReprogramarCitaControlador;