const modelo = require('../../modelo/horarios/EditarHorarioModelo');

class EditarHorarioControlador {

    static async editarHorario(req, res) {

        const { idhorario } = req.params;
        const { fecha, horaInicio, horaFin } = req.body;

        // 1. El id debe ser numérico
        if (!/^\d+$/.test(idhorario)) {
            return res.status(400).json({ error: 'El id del horario no es válido.' });
        }

        // 2. Campos obligatorios
        if (!fecha || !horaInicio || !horaFin) {
            return res.status(400).json({ error: 'Fecha, hora de inicio y hora de fin son obligatorias.' });
        }

        // 3. Formato de la fecha
        const errorFecha = EditarHorarioControlador.verFecha(fecha);
        if (errorFecha) {
            return res.status(400).json({ error: errorFecha });
        }

        // 4. Formato de las horas
        const errorHoras = EditarHorarioControlador.verHoras(horaInicio, horaFin);
        if (errorHoras) {
            return res.status(400).json({ error: errorHoras });
        }

        try {
            // 5. El horario debe existir
            const horario = await modelo.buscarPorId(idhorario);

            if (!horario) {
                return res.status(404).json({ error: 'El horario no existe.' });
            }

            // 6. No puede traslaparse con otro horario del mismo trabajador
            const traslape = await modelo.existeTraslape(
                horario.idtrabajador, fecha, horaInicio, horaFin, idhorario
            );

            if (traslape) {
                return res.status(409).json({ error: 'El horario se cruza con otro horario del trabajador.' });
            }

            // 7. Actualizar
            await modelo.editarHorario(idhorario, fecha, horaInicio, horaFin);

            return res.json({ mensaje: 'Horario editado correctamente.' });

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Error inesperado al editar el horario.' });
        }
    }

    // ---------------- validaciones ----------------

    static verFecha(fecha) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return 'La fecha debe tener el formato AAAA-MM-DD.';
        }

        const [a, m, d] = fecha.split('-').map(Number);
        const f = new Date(a, m - 1, d);

        // Detecta fechas imposibles como 2026-02-31
        if (f.getFullYear() !== a || f.getMonth() !== m - 1 || f.getDate() !== d) {
            return 'La fecha no es válida.';
        }
        return null;
    }

    static verHoras(horaInicio, horaFin) {
        const regexHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

        if (!regexHora.test(horaInicio) || !regexHora.test(horaFin)) {
            return 'Las horas deben tener el formato HH:MM (24 horas).';
        }

        // Pasamos todo a HH:MM:SS para poder comparar como texto
        const normalizar = (h) => (h.length === 5 ? h + ':00' : h);

        if (normalizar(horaFin) <= normalizar(horaInicio)) {
            return 'La hora de fin debe ser mayor que la hora de inicio.';
        }
        return null;
    }
}

module.exports = EditarHorarioControlador;