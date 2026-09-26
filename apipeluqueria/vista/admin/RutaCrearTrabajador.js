const express = require('express');
const router = express.Router();
const CRutas = require('../../controlador/admin/CrearTrabajadorControlador');

router.post('/atrabajadores', CRutas.crearTrabajador);
console.log('✅ Ruta de crear trabajador cargada');
module.exports = router;