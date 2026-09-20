const express = require('express');
const CRutas = require('../../controlador/admin/CrearClienteControlador');
const router = express.Router();

router.post('/aclientes', CRutas.crearCliente);

module.exports = router;