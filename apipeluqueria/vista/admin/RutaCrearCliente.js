const express = require('express');
const CRutas = require('../../controlador/admin/CrearClienteControlador');
const router = express.Router();

router.post('/aclientes', CRutas.crearCliente);
router.post('/registro', CRutas.crearCliente);
router.post('/login', CRutas.loginCliente);

module.exports = router;