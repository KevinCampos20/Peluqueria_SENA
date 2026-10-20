/*
RF-15.2: El cliente reprograma una cita.
PUT /citas/:idcita/reprogramar   body: { idcliente, idhorario }  (idhorario = el nuevo horario)
*/
const modelo = require('../../modelo/clientes/ReprogramarCitaModelo');
// Se reutiliza la regla de las 2 horas de anticipación del RF-15.1
const Cancelar = require('./CancelarCitaControlador');

// Estado de los horarios en la BD: 'Activo' = disponible
const HORARIO_DISPONIBLE = 'Activo';

class ReprogramarCitaControlador {

    static async reprogramarCita(req, res) {

        const { idcita } = req.params;
        const { idcliente, idhorario } = req.body || {};

        // 1. Los ids deben ser numéricos
        if (!/^\d+$/.test(idcita)) {
            return res.status(400).json({ error: 'El id de la cita no es válido.' });
        }

        if (!/^\d+$/.test(String(idcliente ?? ''))) {
            return res.status(400).json({ error: 'El id del cliente es obligatorio y debe ser numérico.' });
        }

        if (!/^\d+$/.test(String(idhorario ?? ''))) {
            return res.status(400).json({ error: 'El id del nuevo horario es obligatorio y debe ser numérico.' });
        }

        try {
            // 2. La cita debe existir
            const cita = await modelo.buscarCita(idcita);

            if (!cita) {
                return res.status(404).json({ error: 'La cita no existe.' });
            }

            // 3. El cliente solo reprograma sus propias citas
            if (String(cita.idCliente) !== String(idcliente)) {
                return res.status(403).json({ error: 'No tiene permisos para reprogramar esta cita.' });
            }

            // 4. Solo se reprograman citas activas
            if (cita.estado !== 'Activa') {
                return res.status(409).json({ error: 'Solo se pueden reprogramar citas activas.' });
            }

            // 5. El nuevo horario debe ser distinto al actual
            if (String(cita.idHorario) === String(idhorario)) {
                return res.status(400).json({ error: 'El nuevo horario es el mismo de la cita actual.' });
            }

            // 6. Debe haber al menos 2 horas de anticipación respecto al horario actual
            if (Cancelar.faltaPoco(cita.fecha, cita.horaInicio)) {
                return res.status(409).json({
                    error: 'No se puede reprogramar con menos de 1 horas de anticipación. Comuníquese con la administración.'
                });
            }

            // 7. El nuevo horario debe existir
            const nuevo = await modelo.buscarHorario(idhorario);

            if (!nuevo) {
                return res.status(404).json({ error: 'El horario seleccionado no existe.' });
            }

            // 8. Debe ser del mismo trabajador de la cita
            const mismo = await modelo.mismoTrabajador(cita.idHorario, idhorario);

            if (!mismo) {
                return res.status(409).json({ error: 'El nuevo horario debe ser del mismo trabajador de la cita.' });
            }

            // 9. No puede ser un horario que ya empezó o que empieza en menos de 2 horas
            if (Cancelar.faltaPoco(nuevo.fecha, nuevo.horaInicio)) {
                return res.status(409).json({ error: 'El nuevo horario ya pasó o empieza muy pronto. Elija otro bloque.' });
            }

            // 10. Debe estar disponible y sin citas activas
            const citasActivas = await modelo.contarCitasActivas(idhorario);

            if (nuevo.estado !== HORARIO_DISPONIBLE || citasActivas > 0) {
                return res.status(409).json({ error: 'El horario seleccionado ya no está disponible. Elija otro bloque.' });
            }

            // 11. Reprogramar (si alguien lo tomó justo antes, devuelve false)
            const hecho = await modelo.reprogramarCita(idcita, cita.idHorario, idhorario);

            if (!hecho) {
                return res.status(409).json({ error: 'El horario seleccionado ya no está disponible. Elija otro bloque.' });
            }

            return res.json({
                mensaje: 'Cita reprogramada correctamente.',
                cita: {
                    idcita: Number(idcita),
                    idhorario: Number(idhorario),
                    fecha: nuevo.fecha,
                    horaInicio: nuevo.horaInicio,
                    horaFinal: nuevo.horaFinal
                }
            });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible reprogramar la cita. Intente nuevamente.' });
        }
    }
}

module.exports = ReprogramarCitaControlador;