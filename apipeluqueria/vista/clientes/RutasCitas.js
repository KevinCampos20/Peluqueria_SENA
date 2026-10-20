const express = require('express');
const CrearCitaRutas = require('../../controlador/clientes/CrearCitaControlador'); // Crear cita
const CCRutas = require('../../controlador/clientes/CancelarCitaControlador'); //RF15.1
const RCRutas = require('../../controlador/clientes/ReprogramarCitaControlador'); //RF15.2

const router = express.Router();

router.post('/citas', CrearCitaRutas.crear); // Crear cita
router.put('/citas/:idcita/cancelar', CCRutas.cancelarCita); //RF15.1
router.put('/citas/:idcita/reprogramar', RCRutas.reprogramarCita); //RF15.2

module.exports = router;