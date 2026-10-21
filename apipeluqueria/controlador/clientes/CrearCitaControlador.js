/*
RF: crear una cita.
POST /citas
Body JSON:
{
    "idCliente": 1,
    "idTrabajador": 1,
    "idHorario": 8
}

La API actual recibe idCliente en el body porque no cuenta
con middleware de autenticación que defina req.usuario.
En producción, debe obtenerse de la sesión o del token.
*/

const modelo = require('../../modelo/clientes/CrearCitaModelo');

function idValido(valor) {
    return /^\d+$/.test(String(valor ?? '')) &&
        Number.isSafeInteger(Number(valor)) &&
        Number(valor) > 0;
}

class CrearCitaControlador {

    static async crear(req, res) {
        const { idCliente, idTrabajador, idHorario } = req.body || {};

        // 1. Validar el cliente.
        if (!idValido(idCliente)) {
            return res.status(400).json({
                correcto: false,
                mensaje: 'El idCliente es obligatorio y debe ser un número entero positivo.'
            });
        }

        // 2. Validar trabajador y horario.
        if (!idValido(idTrabajador) || !idValido(idHorario)) {
            return res.status(400).json({
                correcto: false,
                mensaje: 'Selecciona un trabajador y un horario válidos.'
            });
        }

        try {
            // 3. Crear la cita.
            const idCita = await modelo.crear(
                Number(idCliente),
                Number(idTrabajador),
                Number(idHorario)
            );

            // 4. El horario ya no está disponible o no corresponde
            // al trabajador seleccionado.
            if (!idCita) {
                return res.status(409).json({
                    correcto: false,
                    mensaje: 'Ese horario no está disponible para el trabajador seleccionado.'
                });
            }

            // 5. Cita creada correctamente.
            return res.status(201).json({
                correcto: true,
                mensaje: 'Cita reservada correctamente.',
                idCita
            });

        } catch (error) {

            // El cliente no existe o está inactivo.
            if (error.codigo === 'CLIENTE_NO_DISPONIBLE') {
                return res.status(404).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            // El horario ya fue reservado.
            if (error.codigo === 'HORARIO_NO_DISPONIBLE') {
                return res.status(409).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            // El horario contiene horas inválidas.
            if (error.codigo === 'HORARIO_INVALIDO') {
                return res.status(400).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            // El horario está fuera de la jornada permitida.
            if (error.codigo === 'HORARIO_FUERA_DE_JORNADA') {
                return res.status(400).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            // La cita se cruza con el horario de almuerzo.
            if (error.codigo === 'HORARIO_ALMUERZO') {
                return res.status(400).json({
                    correcto: false,
                    mensaje: error.message
                });
            }

            // Error inesperado del servidor.
            console.error('Error al crear la cita:', error);

            return res.status(500).json({
                correcto: false,
                mensaje: 'No fue posible crear la cita. Intenta nuevamente.'
            });
        }
    }
}

module.exports = CrearCitaControlador;