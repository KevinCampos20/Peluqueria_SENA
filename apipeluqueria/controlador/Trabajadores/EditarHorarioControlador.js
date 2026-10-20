/*
RF-09: El trabajador edita su horario.
*/
const modelo = require('../../modelo/trabajadores/EditarHorarioModelo');

class EditarHorarioControlador {

    static async editarHorario(req, res) {

        const { idhorario } = req.params;
        const { idtrabajador, fecha, horaInicio, horaFinal } = req.body || {};

        // 1. Los ids deben ser numéricos
        if (!/^\d+$/.test(idhorario)) {
            return res.status(400).json({ error: 'El id del horario no es válido.' });
        }

        if (!/^\d+$/.test(String(idtrabajador ?? ''))) {
            return res.status(400).json({ error: 'El id del trabajador es obligatorio y debe ser numérico.' });
        }

        // 2. Campos obligatorios
        if (!fecha || !horaInicio || !horaFinal) {
            return res.status(400).json({ error: 'La fecha, la hora de inicio y la hora final son obligatorias.' });
        }

        // 3. Fecha válida (AAAA-MM-DD)
        const fechaNueva = String(fecha).trim();

        if (!EditarHorarioControlador.fechaValida(fechaNueva)) {
            return res.status(400).json({ error: 'La fecha no es válida. Use el formato AAAA-MM-DD.' });
        }

        // 4. Horas válidas (HH:MM)
        const inicio = EditarHorarioControlador.aMinutos(horaInicio);
        const final = EditarHorarioControlador.aMinutos(horaFinal);

        if (inicio === null || final === null) {
            return res.status(400).json({ error: 'La hora no es válida. Use el formato HH:MM, por ejemplo 15:00.' });
        }

        // 5. La hora de inicio debe ser anterior a la hora final
        if (inicio >= final) {
            return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora final.' });
        }

        try {
            // 6. El horario debe existir
            const horario = await modelo.buscarPorId(idhorario);

            if (!horario) {
                return res.status(404).json({ error: 'El horario no existe o ya fue eliminado.' });
            }

            // 7. El trabajador solo edita su propio horario
            const esSuyo = await modelo.esDelTrabajador(idhorario, idtrabajador);

            if (!esSuyo) {
                return res.status(403).json({ error: 'No tiene permisos para editar este horario.' });
            }

            // 8. No puede cruzarse con otro horario del mismo trabajador ese día
            const otros = await modelo.buscarHorariosDelDia(idtrabajador, fechaNueva, idhorario);

            const hayCruce = otros.some((otro) => {
                const otroInicio = EditarHorarioControlador.aMinutos(otro.horaInicio);
                const otroFinal = EditarHorarioControlador.aMinutos(otro.horaFinal);
                return otroInicio !== null && otroFinal !== null &&
                    inicio < otroFinal && otroInicio < final;
            });

            if (hayCruce) {
                return res.status(409).json({
                    error: 'El nuevo horario se cruza con otro horario registrado. Cambie la fecha o la hora.'
                });
            }

            // 9. Guardar (se guarda con el mismo formato que ya usa la BD: "3:00 pm")
            const textoInicio = EditarHorarioControlador.aTexto(inicio);
            const textoFinal = EditarHorarioControlador.aTexto(final);

            await modelo.editarHorario(idhorario, fechaNueva, textoInicio, textoFinal);

            return res.json({
                mensaje: 'Horario actualizado correctamente.',
                horario: {
                    idhorario: Number(idhorario),
                    fecha: fechaNueva,
                    horaInicio: textoInicio,
                    horaFinal: textoFinal
                }
            });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible editar el horario. Intente nuevamente.' });
        }
    }

    // Valida que la fecha tenga formato AAAA-MM-DD y sea una fecha real
    static fechaValida(fecha) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return false;
        }

        const [anio, mes, dia] = fecha.split('-').map(Number);
        const f = new Date(Date.UTC(anio, mes - 1, dia));

        return f.getUTCFullYear() === anio &&
            f.getUTCMonth() === mes - 1 &&
            f.getUTCDate() === dia;
    }

    // Convierte "15:00", "3:00 pm" o "12:00 m" en minutos desde la medianoche.
    // Devuelve null si el formato no es válido.
    static aMinutos(hora) {
        const texto = String(hora).trim().toLowerCase();

        // Formato 24 horas: 15:00
        let partes = texto.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
        if (partes) {
            return Number(partes[1]) * 60 + Number(partes[2]);
        }

        // Formato 12 horas, como está guardado en la BD: 3:00 pm, 12:00 m
        partes = texto.match(/^(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm|m)$/);
        if (!partes) {
            return null;
        }

        const min = Number(partes[2]);

        // "m" significa mediodía, solo es válido para 12:00
        if (partes[3] === 'm') {
            return partes[1] === '12' && min === 0 ? 12 * 60 : null;
        }

        let h = Number(partes[1]) % 12;
        if (partes[3] === 'pm') {
            h += 12;
        }

        return h * 60 + min;
    }

    // Convierte minutos al texto que usa la BD: "3:00 pm", "12:00 m"
    static aTexto(minutos) {
        const h24 = Math.floor(minutos / 60);
        const min = String(minutos % 60).padStart(2, '0');

        if (h24 === 12 && min === '00') {
            return '12:00 m';
        }

        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        return `${h12}:${min} ${h24 < 12 ? 'am' : 'pm'}`;
    }
}

module.exports = EditarHorarioControlador;