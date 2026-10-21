/*
RF-09: El trabajador edita su horario.
*/
const modelo = require('../../modelo/trabajadores/EditarHorarioModelo');

class EditarHorarioControlador {

    static async editarHorario(req, res) {
        const { idhorario } = req.params;
        const { idtrabajador, fecha, horaInicio, horaFinal } = req.body || {};

        // 1. Validar identificadores: enteros positivos seguros.
        if (!EditarHorarioControlador.idValido(idhorario)) {
            return res.status(400).json({
                error: 'El id del horario no es válido.'
            });
        }

        if (!EditarHorarioControlador.idValido(idtrabajador)) {
            return res.status(400).json({
                error: 'El id del trabajador es obligatorio y debe ser un entero positivo.'
            });
        }

        // 2. Validar campos obligatorios.
        if (
            typeof fecha !== 'string' ||
            typeof horaInicio !== 'string' ||
            typeof horaFinal !== 'string' ||
            !fecha.trim() ||
            !horaInicio.trim() ||
            !horaFinal.trim()
        ) {
            return res.status(400).json({
                error: 'La fecha, la hora de inicio y la hora final son obligatorias.'
            });
        }

        // 3. Validar fecha.
        const fechaNueva = fecha.trim();

        if (!EditarHorarioControlador.fechaValida(fechaNueva)) {
            return res.status(400).json({
                error: 'La fecha no es válida. Use el formato AAAA-MM-DD.'
            });
        }

        // 4. Convertir y validar las horas.
        const inicio = EditarHorarioControlador.aMinutos(horaInicio);
        const final = EditarHorarioControlador.aMinutos(horaFinal);

        if (inicio === null || final === null) {
            return res.status(400).json({
                error: 'La hora no es válida. Use HH:MM o un formato como 3:00 pm.'
            });
        }

        // 5. La hora inicial debe ser anterior a la final.
        if (inicio >= final) {
            return res.status(400).json({
                error: 'La hora de inicio debe ser anterior a la hora final.'
            });
        }

        // 6 y 7. Jornada de la peluquería y almuerzo (regla compartida con el admin).
        const errorJornada = EditarHorarioControlador.validarJornada(inicio, final);

        if (errorJornada) {
            return res.status(400).json({ error: errorJornada });
        }

        try {
            const idHorario = Number(idhorario);
            const idTrabajador = Number(idtrabajador);

            // 8. Comprobar que el horario exista.
            const horario = await modelo.buscarPorId(idHorario);

            if (!horario) {
                return res.status(404).json({
                    error: 'El horario no existe o ya fue eliminado.'
                });
            }

            // 9. Comprobar que el horario pertenezca al trabajador.
            const esSuyo = await modelo.esDelTrabajador(
                idHorario,
                idTrabajador
            );

            if (!esSuyo) {
                return res.status(403).json({
                    error: 'No tiene permisos para editar este horario.'
                });
            }

            // 10. Comprobar solapamientos en la nueva fecha.
            const otros = await modelo.buscarHorariosDelDia(
                idTrabajador,
                fechaNueva,
                idHorario
            );

            const hayCruce = otros.some((otro) => {
                const otroInicio = EditarHorarioControlador.aMinutos(
                    otro.horaInicio
                );

                const otroFinal = EditarHorarioControlador.aMinutos(
                    otro.horaFinal
                );

                return (
                    otroInicio !== null &&
                    otroFinal !== null &&
                    inicio < otroFinal &&
                    otroInicio < final
                );
            });

            if (hayCruce) {
                return res.status(409).json({
                    error: 'El nuevo horario se cruza con otro horario registrado. Cambie la fecha o la hora.'
                });
            }

            // 11. Convertir las horas al formato almacenado en la BD.
            const textoInicio = EditarHorarioControlador.aTexto(inicio);
            const textoFinal = EditarHorarioControlador.aTexto(final);

            // El modelo vuelve a comprobar el horario y la existencia
            // de citas activas dentro de la transacción.
            await modelo.editarHorario(
                idHorario,
                fechaNueva,
                textoInicio,
                textoFinal
            );

            return res.status(200).json({
                correcto: true,
                mensaje: 'Horario actualizado correctamente.',
                horario: {
                    idhorario: idHorario,
                    fecha: fechaNueva,
                    horaInicio: textoInicio,
                    horaFinal: textoFinal
                }
            });

        } catch (err) {
            console.error('Error al editar el horario:', err.message);

            // Errores de negocio lanzados por el modelo.
            switch (err.codigo) {
                case 'HORARIO_NO_ENCONTRADO':
                    return res.status(404).json({
                        error: 'El horario no existe o ya fue eliminado.'
                    });

                case 'HORARIO_CON_CITA_ACTIVA':
                    return res.status(409).json({
                        error: 'No se puede editar un horario que tiene una cita activa. Reprograme o cancele la cita primero.'
                    });

                case 'HORARIO_NO_ACTUALIZADO':
                    return res.status(409).json({
                        error: 'El horario cambió o no pudo actualizarse. Vuelva a consultar e intente nuevamente.'
                    });

                default:
                    return res.status(500).json({
                        error: 'No fue posible editar el horario. Intente nuevamente.'
                    });
            }
        }
    }

    // Reglas de la peluquería. Devuelve el mensaje de error, o null si el horario es válido.
    //  - Abre a las 7:00 a. m. y cierra a las 9:00 p. m.
    //  - La última cita puede comenzar a las 8:00 p. m.
    //  - De 12:00 m. a 1:00 p. m. es la hora del almuerzo.
    static validarJornada(inicio, final) {
        const APERTURA = 7 * 60;
        const ULTIMA_CITA = 20 * 60;
        const CIERRE = 21 * 60;
        const INICIO_ALMUERZO = 12 * 60;
        const FIN_ALMUERZO = 13 * 60;

        if (inicio < APERTURA) {
            return 'La peluquería abre a las 7:00 a. m.';
        }

        if (inicio > ULTIMA_CITA) {
            return 'La última cita puede comenzar a las 8:00 p. m.';
        }

        if (final > CIERRE) {
            return 'El horario debe finalizar como máximo a las 9:00 p. m.';
        }

        if (inicio < FIN_ALMUERZO && final > INICIO_ALMUERZO) {
            return 'No se permiten horarios durante el almuerzo, de 12:00 m. a 1:00 p. m.';
        }

        return null;
    }

    // Comprueba que el identificador sea un entero positivo seguro.
    static idValido(id) {
        if (
            id === null ||
            id === undefined ||
            !/^\d+$/.test(String(id))
        ) {
            return false;
        }

        const numero = Number(id);

        return Number.isSafeInteger(numero) && numero > 0;
    }

    // Valida el formato AAAA-MM-DD y que sea una fecha real.
    static fechaValida(fecha) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return false;
        }

        const [anio, mes, dia] = fecha.split('-').map(Number);
        const f = new Date(Date.UTC(anio, mes - 1, dia));

        return (
            f.getUTCFullYear() === anio &&
            f.getUTCMonth() === mes - 1 &&
            f.getUTCDate() === dia
        );
    }

    // Convierte horas de 24 horas o de 12 horas a minutos.
    static aMinutos(hora) {
        const texto = String(hora).trim().toLowerCase();

        // Formato de 24 horas: 15:00.
        let partes = texto.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

        if (partes) {
            return Number(partes[1]) * 60 + Number(partes[2]);
        }

        // Formato de 12 horas: 3:00 pm, 7:00 am, 12:00 m.
        partes = texto.match(
            /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm|m)$/
        );

        if (!partes) {
            return null;
        }

        const hora12 = Number(partes[1]);
        const minutos = Number(partes[2]);
        const periodo = partes[3];

        // "m" representa mediodía.
        if (periodo === 'm') {
            return hora12 === 12 && minutos === 0
                ? 12 * 60
                : null;
        }

        let hora24 = hora12 % 12;

        if (periodo === 'pm') {
            hora24 += 12;
        }

        return hora24 * 60 + minutos;
    }

    // Convierte minutos al formato de texto de la base de datos.
    static aTexto(minutos) {
        const hora24 = Math.floor(minutos / 60);
        const min = String(minutos % 60).padStart(2, '0');

        if (hora24 === 12 && min === '00') {
            return '12:00 m';
        }

        const hora12 = hora24 % 12 === 0 ? 12 : hora24 % 12;
        const periodo = hora24 < 12 ? 'am' : 'pm';

        return `${hora12}:${min} ${periodo}`;
    }
}

module.exports = EditarHorarioControlador;