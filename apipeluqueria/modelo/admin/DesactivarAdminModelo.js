const dbService = require('../bd/Conexion');

class DesactivarAdminModelo {

    // Busca al administrador (el filtro por rol evita tocar a los trabajadores)
    static async buscarAdmin(id) {
        const query = `
            SELECT idtrabajador, estado
            FROM trabajadores
            WHERE idtrabajador = ?
              AND rol = 'admin'
        `;

        try {
            const resultado = await dbService.query(query, [id]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar el administrador: ${err.message}`);
        }
    }

    // Cuenta cuántos OTROS administradores activos hay en el sistema
    static async contarOtrosAdminsActivos(id) {
        const query = `
            SELECT COUNT(*) AS total
            FROM trabajadores
            WHERE rol = 'admin'
              AND estado = 'Activo'
              AND idtrabajador <> ?
        `;

        try {
            const resultado = await dbService.query(query, [id]);
            return resultado[0].total;
        } catch (err) {
            throw new Error(`Error al consultar los administradores activos: ${err.message}`);
        }
    }

    static async modificarEstado(id) {
        const query = `
            UPDATE trabajadores
            SET estado = ?
            WHERE idtrabajador = ?
              AND rol = 'admin'
        `;

        try {
            return await dbService.query(query, ['Inactivo', id]);
        } catch (err) {
            throw new Error(`Error al modificar el estado del admin: ${err.message}`);
        }
    }
}

module.exports = DesactivarAdminModelo;