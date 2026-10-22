/*
RF-15.2: El cliente reprograma una cita.
PUT /citas/:idcita/reprogramar

Body JSON:
{
    "idcliente": 1,
    "idhorario": 8
}
*/

const modelo = require("../../modelo/clientes/ReprogramarCitaModelo");

const HORARIO_DISPONIBLE = "Activo";

function idValido(valor) {
  return (
    /^\d+$/.test(String(valor ?? "")) &&
    Number.isSafeInteger(Number(valor)) &&
    Number(valor) > 0
  );
}

class ReprogramarCitaControlador {
  static async reprogramarCita(req, res) {
    const { idcita } = req.params;
    const { idcliente, idhorario } = req.body || {};

    // 1. Validar los identificadores.
    if (!idValido(idcita)) {
      return res.status(400).json({
        correcto: false,
        error: "El id de la cita no es válido.",
      });
    }

    if (!idValido(idcliente)) {
      return res.status(400).json({
        correcto: false,
        error:
          "El id del cliente es obligatorio y debe ser un número entero positivo.",
      });
    }

    if (!idValido(idhorario)) {
      return res.status(400).json({
        correcto: false,
        error:
          "El id del nuevo horario es obligatorio y debe ser un número entero positivo.",
      });
    }

    try {
      // 2. Buscar la cita actual.
      const cita = await modelo.buscarCita(Number(idcita));

      if (!cita) {
        return res.status(404).json({
          correcto: false,
          error: "La cita no existe.",
        });
      }

      // 3. Verificar que el cliente sea propietario de la cita.
      if (Number(cita.idCliente) !== Number(idcliente)) {
        return res.status(403).json({
          correcto: false,
          error: "No tienes permisos para reprogramar esta cita.",
        });
      }

      // 4. La cita debe estar activa.
      if (cita.estado !== "Activa") {
        return res.status(409).json({
          correcto: false,
          error: "Solo se pueden reprogramar citas activas.",
        });
      }

      // 5. El nuevo horario debe ser diferente.
      if (Number(cita.idHorario) === Number(idhorario)) {
        return res.status(400).json({
          correcto: false,
          error: "Selecciona un horario diferente al actual.",
        });
      }

      // 6. Consultar el nuevo horario.
      const nuevo = await modelo.buscarHorario(Number(idhorario));

      if (!nuevo) {
        return res.status(404).json({
          correcto: false,
          error: "El horario seleccionado no existe.",
        });
      }

      // 7. Comprobar que ambos horarios pertenezcan
      // al mismo trabajador.
      const mismo = await modelo.mismoTrabajador(
        cita.idHorario,
        Number(idhorario),
      );

      if (!mismo) {
        return res.status(409).json({
          correcto: false,
          error:
            "El nuevo horario debe pertenecer al mismo trabajador de la cita actual.",
        });
      }

      // 8. Verificar disponibilidad antes de reprogramar.
      const citasActivas = await modelo.contarCitasActivas(Number(idhorario));

      if (nuevo.estado !== HORARIO_DISPONIBLE || citasActivas > 0) {
        return res.status(409).json({
          correcto: false,
          error:
            "El horario seleccionado ya no está disponible. Elige otro horario.",
        });
      }

      // 9. Ejecutar la reprogramación.
      // El modelo verifica la anticipación mínima de una hora,
      // la jornada, el almuerzo y la disponibilidad transaccional.
      const hecho = await modelo.reprogramarCita(
        Number(idcita),
        Number(cita.idHorario),
        Number(idhorario),
      );

      if (!hecho) {
        return res.status(409).json({
          correcto: false,
          error:
            "El horario seleccionado ya no está disponible. Elige otro horario.",
        });
      }

      // 10. Confirmar la operación.
      return res.status(200).json({
        correcto: true,
        mensaje: "Cita reprogramada correctamente.",
        cita: {
          idcita: Number(idcita),
          idhorario: Number(idhorario),
          fecha: nuevo.fecha,
          horaInicio: nuevo.horaInicio,
          horaFinal: nuevo.horaFinal,
        },
      });
    } catch (err) {
      // Traducir errores del modelo a respuestas HTTP.
      const respuestas = {
        CITA_NO_ENCONTRADA: [404, "La cita no existe."],
        CITA_NO_ACTIVA: [409, "Solo se pueden reprogramar citas activas."],
        HORARIO_ACTUAL_CAMBIADO: [
          409,
          "El horario actual cambió. Actualiza la información e inténtalo nuevamente.",
        ],
        HORARIO_NO_ENCONTRADO: [404, "El horario seleccionado no existe."],
        HORARIO_NO_DISPONIBLE: [
          409,
          "El horario seleccionado ya no está disponible. Elige otro horario.",
        ],
        MISMO_HORARIO: [400, "Selecciona un horario diferente al actual."],
        ANTICIPACION_INSUFICIENTE: [
          409,
          "La reprogramación debe realizarse con al menos una hora de anticipación. Comunícate con la administración.",
        ],
        HORARIO_FUERA_DE_JORNADA: [400, err.message],
        HORARIO_ALMUERZO: [400, err.message],
        HORARIO_INVALIDO: [400, err.message],
        FECHA_HORA_INVALIDA: [400, err.message],
        HORARIO_PASADO: [409, "No puedes seleccionar un horario que ya pasó."],
        TRABAJADOR_NO_COINCIDE: [
          409,
          "El nuevo horario debe estar disponible con el mismo trabajador de la cita actual.",
        ],
        CITA_NO_ACTUALIZADA: [
          409,
          "No fue posible actualizar la cita. Inténtalo nuevamente.",
        ],
      };

      const respuesta = respuestas[err.codigo];

      if (respuesta) {
        return res.status(respuesta[0]).json({
          correcto: false,
          error: respuesta[1],
        });
      }

      console.error("Error al reprogramar la cita:", err);

      return res.status(500).json({
        correcto: false,
        error: "No fue posible reprogramar la cita. Intenta nuevamente.",
      });
    }
  }
}

module.exports = ReprogramarCitaControlador;
