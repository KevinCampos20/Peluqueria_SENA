/*
RF: crear una cita.
POST /citas
Body JSON: { "idCliente": 1, "idTrabajador": 1, "idHorario": 8 }

La API actual no incluye middleware de autenticación que defina req.usuario,
por eso este controlador recibe idCliente en el body, como los controladores
actuales de cancelar y reprogramar. En producción debe obtenerse de la sesión/token.
*/
const modelo = require('../../modelo/clientes/CrearCitaModelo');

function idValido(valor) {
    return /^\d+$/.test(String(valor ?? '')) && Number(valor) > 0;
}

class CrearCitaControlador {
    static async crear(req, res) {
        const { idCliente, idTrabajador, idHorario } = req.body || {};

        if (!idValido(idCliente)) {
            return res.status(400).json({
                correcto: false,
                mensaje: 'El idCliente es obligatorio y debe ser numérico.'
            });
        }

        if (!idValido(idTrabajador) || !idValido(idHorario)) {
            return res.status(400).json({
                correcto: false,
                mensaje: 'Selecciona un trabajador y un horario válidos.'
            });
        }

        try {
            const idCita = await modelo.crear(
                Number(idCliente),
                Number(idTrabajador),
                Number(idHorario)
            );

            if (!idCita) {
                return res.status(409).json({
                    correcto: false,
                    mensaje: 'Ese horario no está disponible para el trabajador seleccionado.'
                });
            }

            return res.status(201).json({
                correcto: true,
                mensaje: 'Cita reservada correctamente.',
                idCita
            });
        } catch (error) {
            if (error.codigo === 'CLIENTE_NO_DISPONIBLE') {
                return res.status(404).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            if (error.codigo === 'HORARIO_NO_DISPONIBLE') {
                return res.status(409).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            console.error('Error al crear la cita:', error.message);
            return res.status(500).json({
                correcto: false,
                mensaje: 'No fue posible crear la cita. Intenta nuevamente.'
            });
        }
    }
}

module.exports = CrearCitaControlador;
