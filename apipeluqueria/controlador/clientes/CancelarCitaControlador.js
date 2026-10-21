
/*
RF-15.1: El cliente cancela una cita.
PUT /citas/:idcita/cancelar
Body: { idcliente }
*/

const modelo = require('../../modelo/clientes/CancelarCitaModelo');
const Horas = require('../trabajadores/EditarHorarioControlador');

const HORAS_MINIMAS = 1;

function idValido(valor) {
    return /^\d+$/.test(String(valor ?? '')) &&
        Number.isSafeInteger(Number(valor)) &&
        Number(valor) > 0;
}

class CancelarCitaControlador {

    static async cancelarCita(req, res) {
        const { idcita } = req.params;
        const { idcliente } = req.body || {};

        if (!idValido(idcita)) {
            return res.status(400).json({
                correcto: false,
                error: 'El id de la cita no es válido.'
            });
        }

        if (!idValido(idcliente)) {
            return res.status(400).json({
                correcto: false,
                error: 'El id del cliente es obligatorio y debe ser numérico.'
            });
        }

        try {
            const cita = await modelo.buscarCita(Number(idcita));

            if (!cita) {
                return res.status(404).json({
                    correcto: false,
                    error: 'La cita no existe.'
                });
            }

            if (String(cita.idCliente) !== String(idcliente)) {
                return res.status(403).json({
                    correcto: false,
                    error: 'No tiene permisos para cancelar esta cita.'
                });
            }

            if (cita.estado !== 'Activa') {
                return res.status(409).json({
                    correcto: false,
                    error: 'Solo se pueden cancelar citas activas.'
                });
            }

            // La anticipación debe calcularse correctamente.
            const faltaPoco = CancelarCitaControlador.faltaPoco(
                cita.fecha,
                cita.horaInicio
            );

            if (faltaPoco === null) {
                return res.status(400).json({
                    correcto: false,
                    error: 'No se pudo interpretar la fecha u hora de la cita.'
                });
            }

            if (faltaPoco) {
                return res.status(409).json({
                    correcto: false,
                    error: `No se puede cancelar con menos de ${HORAS_MINIMAS} hora de anticipación. Comuníquese con la administración.`
                });
            }

            await modelo.cancelarCita(Number(idcita));

            return res.status(200).json({
                correcto: true,
                mensaje: 'Cita cancelada correctamente.'
            });

        } catch (err) {
            console.error('Error al cancelar la cita:', err.message);

            if (err.codigo === 'CITA_NO_ENCONTRADA') {
                return res.status(404).json({
                    correcto: false,
                    error: err.message
                });
            }

            if (
                err.codigo === 'CITA_NO_ACTIVA' ||
                err.codigo === 'CITA_NO_ACTUALIZADA'
            ) {
                return res.status(409).json({
                    correcto: false,
                    error: err.message
                });
            }

            return res.status(500).json({
                correcto: false,
                error: 'No fue posible cancelar la cita. Intente nuevamente.'
            });
        }
    }

    // true: falta menos de una hora o la cita ya pasó.
    // false: falta una hora o más.
    // null: fecha u hora inválida.
    static faltaPoco(fecha, horaInicio) {
        const minutos = Horas.aMinutos(horaInicio);

        if (minutos === null || minutos === undefined) {
            return null;
        }

        const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            String(fecha).slice(0, 10)
        );

        if (!coincidencia) {
            return null;
        }

        const anio = Number(coincidencia[1]);
        const mes = Number(coincidencia[2]);
        const dia = Number(coincidencia[3]);

        const inicio = new Date(
            anio,
            mes - 1,
            dia,
            Math.floor(minutos / 60),
            minutos % 60
        );

        // Evita aceptar fechas que JavaScript haya normalizado.
        if (
            inicio.getFullYear() !== anio ||
            inicio.getMonth() !== mes - 1 ||
            inicio.getDate() !== dia ||
            !Number.isFinite(inicio.getTime())
        ) {
            return null;
        }

        return inicio.getTime() - Date.now() <
            HORAS_MINIMAS * 60 * 60 * 1000;
    }
}

module.exports = CancelarCitaControlador;