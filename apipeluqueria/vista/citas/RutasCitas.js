const express = require('express');

const CancelarCitaControlador = require('../../controlador/citas/CancelarCitaControlador');

const ReprogramarCitaControlador = require('../../controlador/citas/ReprogramarCitaControlador');

const router = express.Router();

router.put('/citas/:idcita/cancelar', CancelarCitaControlador.cancelarCita);//RF15

router.put('/citas/:idcita/reprogramar', ReprogramarCitaControlador.reprogramarCita);//RF16

module.exports = router;