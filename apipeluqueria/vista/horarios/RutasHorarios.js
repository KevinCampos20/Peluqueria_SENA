const express = require('express');

const CRutas = require('../../controlador/horarios/ConsultarHorariosControlador');
const EditarHorarioControlador = require('../../controlador/horarios/EditarHorarioControlador');
const EliminarHorarioControlador = require('../../controlador/horarios/EliminarHorarioControlador');

const router = express.Router();

router.get('/horarios', CRutas.consultarHorarios);//RF06

router.put('/horarios/:idhorario', EditarHorarioControlador.editarHorario);//RF09
router.delete('/horarios/:idhorario', EliminarHorarioControlador.eliminarHorario);//RF10
module.exports = router;