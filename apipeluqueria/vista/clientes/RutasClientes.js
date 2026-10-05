const express = require('express');
const CRutas = require('../../controlador/clientes/CrearClienteControlador');
const LCRutas = require('../../controlador/clientes/LoginClienteControlador');

const router = express.Router();

router.post('/usuario/crear', CRutas.crearCliente);//RF01
router.post('/login', LCRutas.validarCredencial);

module.exports = router;