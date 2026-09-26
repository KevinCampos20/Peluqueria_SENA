const modelo = require('../../modelo/admin/CrearClienteModelo');
const bcrypt = require('bcrypt');
class CrearClienteControlador {     // funcion crear nuevo cliente

  static async crearCliente(req, res) {
    const { t1: tipoD, t2: numeroD, t3: nom, t4: dir, t5: tel, t6: email, t7: contras } = req.body;

    // ---------------👁️‍🗨️ validaciones 👁️‍🗨️---------------
    // Validar campos vacíos❓❓❓❓❓----------------
    const errorCampos = CrearClienteControlador.verCampos(tipoD, numeroD, nom, dir, tel, email, contras);
    if (errorCampos) {
      return res.status(400).json({ error: errorCampos });
    }
    // Validar tipo documento❓❓❓❓❓❓------------------
    const erortipoD = CrearClienteControlador.vertipoD(tipoD);
    if (erortipoD) {
      return res.status(400).json({ error: erortipoD });
    }
    // Validar documento❓❓❓❓❓❓---------------------
    const erorIde = CrearClienteControlador.verIde(numeroD);
    if (erorIde) {
      return res.status(400).json({ error: erorIde });
    }
    // Validar nombres completos ❓❓❓❓❓❓❓------------
    const errornom = CrearClienteControlador.vernom(nom);
    if (errornom) {
      return res.status(400).json({ error: errornom });
    }
    // Validar direccion ❓❓❓❓❓❓❓------------
    const errordir = CrearClienteControlador.verdir(dir);
    if (errordir) {
      return res.status(400).json({ error: errordir });
    }
    // Validar teléfono❓❓❓❓❓❓❓-----------------------
    const errortel = CrearClienteControlador.verTel(tel);
    if (errortel) {
      return res.status(400).json({ error: errortel });
    }
    // Validar correo❓❓❓❓❓❓❓--------------------------
    const errorem = CrearClienteControlador.veremail(email);
    if (errorem) {
      return res.status(400).json({ error: errorem });
    }
    // Validar contraseña❓❓❓❓❓❓-----------------------
    const errorkey = CrearClienteControlador.verkey(contras);
    if (errorkey) {
      return res.status(400).json({ error: errorkey });
    }

    try {
      const result = await modelo.crearClientes(tipoD, numeroD, nom, dir, tel, email, contras);
      res.status(201).json({ mensaje: 'Cliente creado con exito', id: result.insertId });
    } catch (err) {
      if (err.message.includes("Duplicate entry")) {
        return res.status(409).json({
          error: 'Ya existe un usuario con estos datos.',
          sugerencia: 'intenta recuperar la cuenta o inicia sesión.'
        });
      } else {
        return res.status(500).json({ error: 'Error inesperado: ' + err.message });
      }
    }
    // ------------👁️‍🗨️ fin validaciones👁️‍🗨️------------

  }//cerrar crearcliente------------------------------
  //👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊
  //-------------------validaciones-----------------------------
  //👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊

  static verCampos(tipoD, numeroD, nom, dir, tel, email, contras) {
    if (!tipoD || !numeroD || !nom || !dir || !tel || !email || !contras) {
      return 'Todos los campos son obligatorios.';
    }
    return null; // no encontro campos vacios
  }//cerrar verCampos

  //verificar nombres completos
  static vertipoD(tipoD) {
    const tip = /^[A-Z\s]{2,3}$/;
    if (!tip.test(tipoD)) {
      return 'tipo de documento invalidos minimo 2 caracteres o maximo 3  CC, TI, CE';
    } else {
      return null;
    }
  }
  //validar documento
  static verIde(numeroD) {
    if (!/^\d{8,10}$/.test(numeroD)) {
      return 'La identificación debe tener entre 8 y 10 dígitos numéricos.';
    } else {
      return null; // Todo bien
    }
  }
  //verificar nombres completos
  static vernom(nom) {
    const name = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,100}$/;
    if (!name.test(nom)) {
      return 'Nombres y apellidos invalidos minimo 3 caracteres o maximo 100 solo letras minuscula o ]Mayuscula';
    } else {
      return null;
    }
  }

  static verdir(direccion) {
    // Expresión regular que permite:
    // - Letras (mayúsculas, minúsculas, con tildes y Ñ)
    // - Números (0-9)
    // - Espacios en blanco
    // - Caracteres especiales comunes en direcciones: . , # - / º ª
    // - Longitud mínima de 5 caracteres y máxima de 200
    const dirRegex = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s.,#\/ºª\-]{5,200}$/;

    if (!dirRegex.test(direccion)) {
      return 'Dirección inválida. Mínimo 5 caracteres, máximo 200. Solo se permiten letras, números, espacios y caracteres como #, -, ., , , /, º, ª';
    } else {
      return null;
    }
  }

  //verificar telefono
  static verTel(tel) {
    if (!/^\d{10}$/.test(tel)) {
      return 'El teléfono debe tener exactamente 10 dígitos numéricos.';
    } else {
      return null; // todo bien
    }
  }

  //validar correo
  static veremail(email) {
    const er = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!er.test(email) || email.length > 250) {
      return 'Correo inválido. Ejemplo válido: ejemplo@email.com';
    } else {
      return null;
    }
  }//cerrar veremail

  //verificar contraseña
  static verkey(contras) {
    const key = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!key.test(contras)) {
      return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial.';
    } else {
      return null;
    }
  }
  //👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊👊
  // Función para iniciar sesión como cliente
  static async loginCliente(req, res) {
    const { email, contras } = req.body;

    if (!email || !contras) {
      return res.status(400).json({
        error: 'El correo y la contraseña son obligatorios.'
      });
    }

    try {
      const resultado = await modelo.buscarClientePorCorreo(email);

      if (resultado.length === 0) {
        return res.status(401).json({
          error: 'Correo o contraseña incorrectos.'
        });
      }

      const cliente = resultado[0];

      const contraseñaCorrecta = await bcrypt.compare(
        contras,
        cliente.contrasena
      );

      if (!contraseñaCorrecta) {
        return res.status(401).json({
          error: 'Correo o contraseña incorrectos.'
        });
      }

      return res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        cliente: {
          id: cliente.idcliente,
          nombres: cliente.nombres,
          correo: cliente.correo
        }
      });

    } catch (err) {
      return res.status(500).json({
        error: 'Error al iniciar sesión: ' + err.message
      });
    }
  }
}

module.exports = CrearClienteControlador;