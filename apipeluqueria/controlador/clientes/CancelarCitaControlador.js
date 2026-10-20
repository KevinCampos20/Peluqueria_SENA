/*
RF-15.1: El cliente cancela una cita.
PUT /citas/:idcita/cancelar   body: { idcliente }
*/
const modelo = require('../../modelo/clientes/CancelarCitaModelo');
// Se reutiliza la conversión de horas del RF-09
const Horas = require('../trabajadores/EditarHorarioControlador');

const HORAS_MINIMAS = 1; // anticipación mínima para cancelar o reprogramar

class CancelarCitaControlador {

    static async cancelarCita(req, res) {

        const { idcita } = req.params;
        const { idcliente } = req.body || {};

        // 1. Los ids deben ser numéricos
        if (!/^\d+$/.test(idcita)) {
            return res.status(400).json({ error: 'El id de la cita no es válido.' });
        }

        if (!/^\d+$/.test(String(idcliente ?? ''))) {
            return res.status(400).json({ error: 'El id del cliente es obligatorio y debe ser numérico.' });
        }

        try {
            // 2. La cita debe existir
            const cita = await modelo.buscarCita(idcita);

            if (!cita) {
                return res.status(404).json({ error: 'La cita no existe.' });
            }

            // 3. El cliente solo cancela sus propias citas
            if (String(cita.idCliente) !== String(idcliente)) {
                return res.status(403).json({ error: 'No tiene permisos para cancelar esta cita.' });
            }

            // 4. Solo se cancelan citas activas
            if (cita.estado !== 'Activa') {
                return res.status(409).json({ error: 'Solo se pueden cancelar citas activas.' });
            }

            // 5. Debe haber al menos 2 horas de anticipación
            if (CancelarCitaControlador.faltaPoco(cita.fecha, cita.horaInicio)) {
                return res.status(409).json({
                    error: `No se puede cancelar con menos de ${HORAS_MINIMAS} horas de anticipación. Comuníquese con la administración.`
                });
            }

            // 6. Cancelar y liberar el horario
            await modelo.cancelarCita(idcita);

            return res.json({ mensaje: 'Cita cancelada correctamente. El horario quedó disponible.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible cancelar la cita. Intente nuevamente.' });
        }
    }

    // true si la hora de inicio ya pasó o falta menos de HORAS_MINIMAS
    static faltaPoco(fecha, horaInicio) {
        const minutos = Horas.aMinutos(horaInicio);

        if (minutos === null) {
            return false;
        }

        const [anio, mes, dia] = String(fecha).split('-').map(Number);
        const inicio = new Date(anio, mes - 1, dia, Math.floor(minutos / 60), minutos % 60);

        return inicio.getTime() - Date.now() < HORAS_MINIMAS * 60 * 60 * 1000;
    }
}

module.exports = CancelarCitaControlador;