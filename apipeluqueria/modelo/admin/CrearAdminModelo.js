const dbService = require('../bd/Conexion');
const bcrypt = require('bcrypt');

class CrearAdminModelo {

    static async crearAdmin(tipoD, numeroD, nom, dir, tel, email, contras) {

        const query = `
            INSERT INTO trabajadores
            (tipoDocumento, numeroDocumento, nombres, direccion, telefono, correo, contrasena, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const salto = 10;

            // Encriptar contraseña
            const contra = await bcrypt.hash(contras, salto);

            // Rol que tendrá el nuevo Admin
            const rol = 'admin';

            return await dbService.query(query, [
                tipoD,
                numeroD,
                nom,
                dir,
                tel,
                email,
                contra,
                rol
            ]);

        } catch (err) {
            throw new Error(`Error al crear admin: ${err.message}`);
        }
    }
}

module.exports = CrearAdminModelo;