
const mysql = require('mysql2');
const dbConfig = require('./Config');

class Conexion {
  constructor() {
    this.pool = mysql.createPool(dbConfig);

    // Verifica la conexión al iniciar.
    this.pool.getConnection((err, connection) => {
      if (err) {
        console.error(
          'Error al conectar a la base de datos:',
          err.message
        );
        return;
      }

      console.log('✅ Conectado a la base de datos');
      connection.release();
    });
  }

  // Ejecuta consultas individuales.
  async query(queryString, params = []) {
    try {
      const [results] = await this.pool
        .promise()
        .query(queryString, params);

      return results;
    } catch (err) {
      console.error('Error durante la consulta:', err.message);
      throw err;
    }
  }

  // Ejecuta varias consultas en una única transacción.
  async transaccion(trabajo) {
    const conexion = await this.pool.promise().getConnection();
    let transaccionIniciada = false;

    try {
      await conexion.beginTransaction();
      transaccionIniciada = true;

      const resultado = await trabajo(async (sql, params = []) => {
        const [resultados] = await conexion.query(sql, params);
        return resultados;
      });

      await conexion.commit();
      transaccionIniciada = false;

      return resultado;
    } catch (err) {
      if (transaccionIniciada) {
        try {
          await conexion.rollback();
        } catch (errorRollback) {
          console.error(
            'Error durante el rollback:',
            errorRollback.message
          );
        }
      }

      console.error(
        'Error durante la transacción:',
        err.message
      );

      throw err;
    } finally {
      conexion.release();
    }
  }
}

module.exports = new Conexion();