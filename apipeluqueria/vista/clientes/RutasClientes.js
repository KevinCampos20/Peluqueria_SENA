const express = require('express');
const CRutas = require('../../controlador/clientes/CrearClienteControlador');
const LCRutas = require('../../controlador/clientes/LoginClienteControlador');
const DCRutas = require('../../controlador/clientes/DesactivarClienteControlador');

const router = express.Router();

router.post('/usuario/crear', CRutas.crearCliente);//RF01
router.post('/login', LCRutas.validarCredencial);
router.put('/usuario/desactivar/:idcliente', DCRutas.desactivarCuenta);

module.exports = router;