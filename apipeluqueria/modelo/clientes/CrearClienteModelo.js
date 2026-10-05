const dbService = require('../bd/Conexion');
const bcrypt = require('bcrypt');

class CrearClienteModelo {

  // Funcion para crear nuevos clientes por el admin
  static async crearClientes(tipoD, numeroD, nom, dir, tel, email, contras) {
    const query = 'INSERT INTO clientes (tipoDocumento, numeroDocumento, nombres, direccion, telefono, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)';

    try {
      // Generar el hash de la contraseña con bcrypt
      const salto = 10;
      const contra = await bcrypt.hash(contras, salto);

      return await dbService.query(query, [
        tipoD,
        numeroD,
        nom,
        dir,
        tel,
        email,
        contra
      ]);

    } catch (err) {
      throw new Error(`Error al crear su nueva cuenta cliente: ${err.message}`);
    }
  } // <-- aquí termina crearClientes()


  // Función para buscar un cliente por correo
  static async buscarClientePorCorreo(email) {
    const query = 'SELECT * FROM clientes WHERE correo = ?';

    try {
      const resultado = await dbService.query(query, [email]);
      return resultado;

    } catch (err) {
      throw new Error(`Error al buscar el cliente: ${err.message}`);
    }
  }

} // <-- aquí termina la clase

module.exports = CrearClienteModelo;