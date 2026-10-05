const express = require('express');
const LTRutas = require('../../controlador/Trabajadores/LoginTrabajadorControlador');
const HTRutas = require('../../controlador/Trabajadores/ConsultarHorariosTrabajadorControlador');

const router = express.Router();

router.post('/trabajador/login', LTRutas.validarCredencial);
router.get('/trabajador/horarios/:idtrabajador', HTRutas.consultarHorarios);

module.exports = router;