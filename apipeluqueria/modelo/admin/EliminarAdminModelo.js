const dbService = require('../bd/Conexion');

class EliminarAdminModelo {

    // Busca el usuario para saber si existe y qué rol tiene
    static async buscarPorId(idadmin) {

        const query = `
            SELECT idtrabajador, nombres, rol, estado
            FROM trabajadores
            WHERE idtrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idadmin]);
            return resultado.length ? resultado[0] : null;
        } catch (err) {
            throw new Error(`Error al buscar el administrador: ${err.message}`);
        }
    }

    // Cuenta cuántos OTROS administradores activos quedarían en el sistema
    static async contarOtrosAdminsActivos(idadmin) {

        const query = `
            SELECT COUNT(*) AS total
            FROM trabajadores
            WHERE rol = 'admin'
              AND estado = 'Activo'
              AND idtrabajador <> ?
        `;

        try {
            const resultado = await dbService.query(query, [idadmin]);
            return resultado[0].total;
        } catch (err) {
            throw new Error(`Error al consultar los administradores activos: ${err.message}`);
        }
    }

    // Cuenta los horarios asociados (la llave foránea impediría el borrado)
    static async contarHorarios(idadmin) {

        const query = `
            SELECT COUNT(*) AS total
            FROM horarios
            WHERE idtrabajador = ?
        `;

        try {
            const resultado = await dbService.query(query, [idadmin]);
            return resultado[0].total;
        } catch (err) {
            throw new Error(`Error al consultar los horarios del administrador: ${err.message}`);
        }
    }

    // Elimina al administrador (el filtro por rol evita borrar otro tipo de usuario)
    static async eliminarAdmin(idadmin) {

        const query = `
            DELETE FROM trabajadores
            WHERE idtrabajador = ?
              AND rol = 'admin'
        `;

        try {
            const resultado = await dbService.query(query, [idadmin]);
            return resultado;
        } catch (err) {
            throw new Error(`Error al eliminar el administrador: ${err.message}`);
        }
    }
}

module.exports = EliminarAdminModelo;