const express = require('express');

const CancelarCitaControlador = require('../../controlador/citas/CancelarCitaControlador');

const ReprogramarCitaControlador = require('../../controlador/citas/ReprogramarCitaControlador');

const router = express.Router();

router.put('/citas/:idcita/cancelar', CancelarCitaControlador.cancelarCita);//RF15.1

router.put('/citas/:idcita/reprogramar', ReprogramarCitaControlador.reprogramarCita);//RF15.2

module.exports = router;