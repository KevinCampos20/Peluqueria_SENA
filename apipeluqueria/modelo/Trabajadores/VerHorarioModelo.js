const dbService = require("../bd/Conexion");

class VerHorarioModelo {
  static validarId(id) {
    return /^\d+$/.test(String(id ?? "")) && Number(id) > 0;
  }

  static validarFecha(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha ?? ""))) {
      return false;
    }

    const [anio, mes, dia] = fecha.split("-").map(Number);
    const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));

    return (
      fechaUTC.getUTCFullYear() === anio &&
      fechaUTC.getUTCMonth() === mes - 1 &&
      fechaUTC.getUTCDate() === dia
    );
  }

  static async buscaTodoDia(idTrabajador, fechaConsulta) {
    if (!this.validarId(idTrabajador)) {
      throw new Error("El ID del trabajador no es válido.");
    }

    const fecha = fechaConsulta || new Date().toISOString().slice(0, 10);

    if (!this.validarFecha(fecha)) {
      throw new Error("La fecha debe tener el formato AAAA-MM-DD.");
    }

    const query = `
      SELECT
        h.idHorario AS idHorario,
        t.nombres AS nombresTrabajador,
        h.fecha,
        h.horaInicio,
        h.horaFinal,
        rh.estado AS estadoRegistro
      FROM reghorarios rh
      INNER JOIN trabajadores t
        ON rh.idTrabajador = t.idTrabajador
      INNER JOIN horarios h
        ON rh.idHorario = h.idHorario
      WHERE h.fecha = ?
        AND rh.idTrabajador = ?
      ORDER BY h.horaInicio
    `;

    return dbService.query(query, [fecha, Number(idTrabajador)]);
  }

  static async buscarEstado(idTrabajador, fechaConsulta, est) {
    if (!["A", "I"].includes(String(est).toUpperCase())) {
      throw new Error("El estado solicitado no es válido.");
    }

    const estado = String(est).toUpperCase() === "A"
      ? "Activo"
      : "Inactivo";

    if (!this.validarId(idTrabajador)) {
      throw new Error("El ID del trabajador no es válido.");
    }

    const fecha = fechaConsulta || new Date().toISOString().slice(0, 10);

    if (!this.validarFecha(fecha)) {
      throw new Error("La fecha debe tener el formato AAAA-MM-DD.");
    }

    const query = `
      SELECT
        h.idHorario AS idHorario,
        t.nombres AS nombresTrabajador,
        h.fecha,
        h.horaInicio,
        h.horaFinal,
        rh.estado AS estadoRegistro
      FROM reghorarios rh
      INNER JOIN trabajadores t
        ON rh.idTrabajador = t.idTrabajador
      INNER JOIN horarios h
        ON rh.idHorario = h.idHorario
      WHERE h.fecha = ?
        AND rh.idTrabajador = ?
        AND rh.estado = ?
      ORDER BY h.horaInicio
    `;

    return dbService.query(query, [
      fecha,
      Number(idTrabajador),
      estado,
    ]);
  }

  static async buscarTodo(id, pag = 1, limit = 50) {
    if (!this.validarId(id)) {
      throw new Error("El ID del trabajador no es válido.");
    }

    const pagina = Number(pag);
    const limite = Number(limit);

    if (
      !Number.isInteger(pagina) ||
      pagina < 1 ||
      !Number.isInteger(limite) ||
      limite < 1 ||
      limite > 100
    ) {
      throw new Error("Los parámetros de paginación no son válidos.");
    }

    const offset = (pagina - 1) * limite;

    const query = `
      SELECT
        h.idHorario AS idHorario,
        t.nombres AS nombresTrabajador,
        h.fecha,
        h.horaInicio,
        h.horaFinal,
        rh.estado AS estadoRegistro
      FROM reghorarios rh
      INNER JOIN trabajadores t
        ON rh.idTrabajador = t.idTrabajador
      INNER JOIN horarios h
        ON rh.idHorario = h.idHorario
      WHERE rh.idTrabajador = ?
      ORDER BY h.fecha, h.horaInicio
      LIMIT ? OFFSET ?
    `;

    return dbService.query(query, [
      Number(id),
      limite,
      offset,
    ]);
  }
}

module.exports = VerHorarioModelo;