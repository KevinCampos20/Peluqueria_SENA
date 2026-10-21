/*
RF-11: El administrador edita un horario.
*/
const modelo = require('../../modelo/admin/EditarHorariosAdminModelo');
// Se reutilizan las validaciones de fecha y hora del RF-09
const Horas = require('../trabajadores/EditarHorarioControlador');

class EditarHorariosAdminControlador {

    static async editarHorario(req, res) {

        const { idhorario } = req.params;
        const { fecha, horaInicio, horaFinal, estado } = req.body || {};

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idhorario)) {
            return res.status(400).json({ error: 'El id del horario no es válido.' });
        }

        // 2. Campos obligatorios
        if (!fecha || !horaInicio || !horaFinal) {
            return res.status(400).json({ error: 'La fecha, la hora de inicio y la hora final son obligatorias.' });
        }

        // 3. Fecha válida (AAAA-MM-DD)
        const fechaNueva = String(fecha).trim();

        if (!Horas.fechaValida(fechaNueva)) {
            return res.status(400).json({ error: 'La fecha no es válida. Use el formato AAAA-MM-DD.' });
        }

        // 4. Horas válidas (HH:MM)
        const inicio = Horas.aMinutos(horaInicio);
        const final = Horas.aMinutos(horaFinal);

        if (inicio === null || final === null) {
            return res.status(400).json({ error: 'La hora no es válida. Use el formato HH:MM, por ejemplo 15:00.' });
        }

        // 5. La hora de inicio debe ser anterior a la hora final
        if (inicio >= final) {
            return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora final.' });
        }

        // 5.1 Jornada de la peluquería y almuerzo (misma regla que el trabajador)
        const errorJornada = Horas.validarJornada(inicio, final);

        if (errorJornada) {
            return res.status(400).json({ error: errorJornada });
        }

        // 6. El estado es opcional; si viene debe ser Activo o Inactivo
        let estadoNuevo = null;

        if (estado !== undefined && estado !== null && String(estado).trim() !== '') {
            const e = String(estado).trim().toLowerCase();

            if (e !== 'activo' && e !== 'inactivo') {
                return res.status(400).json({ error: 'El estado debe ser Activo o Inactivo.' });
            }

            estadoNuevo = e === 'activo' ? 'Activo' : 'Inactivo';
        }

        try {
            // 7. El horario debe existir
            const horario = await modelo.buscarPorId(idhorario);

            if (!horario) {
                return res.status(404).json({ error: 'El horario no existe o ya fue eliminado.' });
            }

            // 8. No puede cruzarse con otro horario del mismo trabajador ese día
            const otros = await modelo.buscarHorariosDelDia(idhorario, fechaNueva);

            const hayCruce = otros.some((otro) => {
                const otroInicio = Horas.aMinutos(otro.horaInicio);
                const otroFinal = Horas.aMinutos(otro.horaFinal);
                return otroInicio !== null && otroFinal !== null &&
                    inicio < otroFinal && otroInicio < final;
            });

            if (hayCruce) {
                return res.status(409).json({
                    error: 'El nuevo horario se cruza con otro horario del trabajador. Cambie la fecha o la hora.'
                });
            }

            // 9. Guardar (con el mismo formato que ya usa la BD: "3:00 pm")
            const textoInicio = Horas.aTexto(inicio);
            const textoFinal = Horas.aTexto(final);

            await modelo.editarHorario(idhorario, fechaNueva, textoInicio, textoFinal, estadoNuevo);

            return res.json({
                mensaje: 'Horario actualizado correctamente.',
                horario: {
                    idhorario: Number(idhorario),
                    fecha: fechaNueva,
                    horaInicio: textoInicio,
                    horaFinal: textoFinal,
                    estado: estadoNuevo || horario.estado
                }
            });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'No fue posible editar el horario. Intente nuevamente.' });
        }
    }
}

module.exports = EditarHorariosAdminControlador;