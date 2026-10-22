const dbService = require("../bd/Conexion");

const HORARIO_DISPONIBLE = "Activo";
const HORARIO_RESERVADO = "Inactivo";

class CancelarCitaModelo {
  // Busca una cita y los datos de su horario.
  static async buscarCita(idcita) {
    const query = `
            SELECT
                c.idCita,
                c.idCliente,
                c.idHorario,
                c.estado,
                h.fecha,
                h.horaInicio,
                h.horaFinal
            FROM citas c
            INNER JOIN horarios h
                ON h.idHorario = c.idHorario
            WHERE c.idCita = ?
        `;

    try {
      const resultado = await dbService.query(query, [idcita]);
      return resultado.length ? resultado[0] : null;
    } catch (err) {
      throw new Error(`Error al buscar la cita: ${err.message}`);
    }
  }

  // Cancela la cita y libera el horario dentro de una transacción.
  static async cancelarCita(idcita) {
    try {
      return await dbService.transaccion(async (q) => {
        // Bloquea la cita para evitar cancelaciones simultáneas.
        const resultado = await q(
          `SELECT idCita, idHorario, estado
                     FROM citas
                     WHERE idCita = ?
                     FOR UPDATE`,
          [idcita],
        );

        if (resultado.length === 0) {
          const error = new Error("La cita no existe.");
          error.codigo = "CITA_NO_ENCONTRADA";
          throw error;
        }

        const cita = resultado[0];

        if (cita.estado !== "Activa") {
          const error = new Error("Solo se pueden cancelar citas activas.");
          error.codigo = "CITA_NO_ACTIVA";
          throw error;
        }

        // Marca la cita como cancelada.
        const actualizacion = await q(
          `UPDATE citas
                     SET estado = 'Cancelada'
                     WHERE idCita = ?
                       AND estado = 'Activa'`,
          [idcita],
        );

        if (actualizacion.affectedRows !== 1) {
          const error = new Error("No fue posible cancelar la cita.");
          error.codigo = "CITA_NO_ACTUALIZADA";
          throw error;
        }

        // Comprueba si quedan otras citas activas en ese horario.
        const conteo = await q(
          `SELECT COUNT(*) AS total
                     FROM citas
                     WHERE idHorario = ?
                       AND estado = 'Activa'`,
          [cita.idHorario],
        );

        // Solo libera el horario si ya no tiene citas activas.
        if (Number(conteo[0].total) === 0) {
          await q(
            `UPDATE horarios
                         SET estado = ?
                         WHERE idHorario = ?
                           AND estado = ?`,
            [HORARIO_DISPONIBLE, cita.idHorario, HORARIO_RESERVADO],
          );

          await q(
            `UPDATE reghorarios
                         SET estado = ?
                         WHERE idHorario = ?
                           AND estado = ?`,
            [HORARIO_DISPONIBLE, cita.idHorario, HORARIO_RESERVADO],
          );
        }

        return true;
      });
    } catch (err) {
      if (err.codigo) {
        throw err;
      }

      console.error("Error al cancelar la cita:", err.message);

      throw new Error(`Error al cancelar la cita: ${err.message}`);
    }
  }
}

module.exports = CancelarCitaModelo;
