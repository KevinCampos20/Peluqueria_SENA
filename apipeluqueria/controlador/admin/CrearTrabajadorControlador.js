const modelo = require('../../modelo/admin/CrearTrabajadorModelo');

class CrearTrabajadorControlador {

    static async crearTrabajador(req, res) {

        const {
            t1: tipoD,
            t2: numeroD,
            t3: nom,
            t4: dir,
            t5: tel,
            t6: email,
            t7: contras
        } = req.body;

        // Validar campos obligatorios
        const errorCampos = CrearTrabajadorControlador.verCampos(
            tipoD,
            numeroD,
            nom,
            dir,
            tel,
            email,
            contras
        );

        if (errorCampos) {
            return res.status(400).json({ error: errorCampos });
        }

        // Validar tipo de documento
        const errorTipoD = CrearTrabajadorControlador.vertipoD(tipoD);

        if (errorTipoD) {
            return res.status(400).json({ error: errorTipoD });
        }

        // Validar número de documento
        const errorIde = CrearTrabajadorControlador.verIde(numeroD);

        if (errorIde) {
            return res.status(400).json({ error: errorIde });
        }

        // Validar nombres
        const errorNom = CrearTrabajadorControlador.vernom(nom);

        if (errorNom) {
            return res.status(400).json({ error: errorNom });
        }

        // Validar dirección
        const errorDir = CrearTrabajadorControlador.verdir(dir);

        if (errorDir) {
            return res.status(400).json({ error: errorDir });
        }

        // Validar teléfono
        const errorTel = CrearTrabajadorControlador.verTel(tel);

        if (errorTel) {
            return res.status(400).json({ error: errorTel });
        }

        // Validar correo
        const errorEmail = CrearTrabajadorControlador.veremail(email);

        if (errorEmail) {
            return res.status(400).json({ error: errorEmail });
        }

        // Validar contraseña
        const errorKey = CrearTrabajadorControlador.verkey(contras);

        if (errorKey) {
            return res.status(400).json({ error: errorKey });
        }

        try {

            const result = await modelo.crearTrabajador(
                tipoD,
                numeroD,
                nom,
                dir,
                tel,
                email,
                contras
            );

            return res.status(201).json({
                mensaje: 'Trabajador creado con exito',
                id: result.insertId
            });

        } catch (err) {

            if (err.message.includes('Duplicate entry')) {

                return res.status(409).json({
                    error: 'Ya existe un trabajador con estos datos.'
                });

            }

            return res.status(500).json({
                error: 'Error inesperado: ' + err.message
            });
        }
    }


    static verCampos(tipoD, numeroD, nom, dir, tel, email, contras) {

        if (
            !tipoD ||
            !numeroD ||
            !nom ||
            !dir ||
            !tel ||
            !email ||
            !contras
        ) {
            return 'Todos los campos son obligatorios.';
        }

        return null;
    }


    static vertipoD(tipoD) {

        const tip = /^[A-Z\s]{2,3}$/;

        if (!tip.test(tipoD)) {
            return 'Tipo de documento inválido. Use CC, TI o CE.';
        }

        return null;
    }


    static verIde(numeroD) {

        if (!/^\d{8,10}$/.test(numeroD)) {
            return 'La identificación debe tener entre 8 y 10 dígitos numéricos.';
        }

        return null;
    }


    static vernom(nom) {

        const name = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,100}$/;

        if (!name.test(nom)) {
            return 'Nombres y apellidos inválidos. Solo se permiten letras.';
        }

        return null;
    }


    static verdir(direccion) {

        const dirRegex = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s.,#ºª\-\/]{5,200}$/;

        if (!dirRegex.test(direccion)) {
            return 'Dirección inválida.';
        }

        return null;
    }


    static verTel(tel) {

        if (!/^\d{10}$/.test(tel)) {
            return 'El teléfono debe tener exactamente 10 dígitos numéricos.';
        }

        return null;
    }


    static veremail(email) {

        const er = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!er.test(email) || email.length > 250) {
            return 'Correo inválido. Ejemplo: ejemplo@email.com';
        }

        return null;
    }


    static verkey(contras) {

        const key = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!key.test(contras)) {
            return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial.';
        }

        return null;
    }
}

module.exports = CrearTrabajadorControlador;