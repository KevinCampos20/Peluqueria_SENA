const express = require('express');
const CRutas = require('../../controlador/admin/CrearClienteControlador');
const TRutas = require('../../controlador/admin/CrearTrabajadorControlador');
const ARutas = require('../../controlador/admin/CrearAdminControlador');
const LRutas = require('../../controlador/admin/LoginAdminControlador');
const HRutas = require('../../controlador/admin/ConsultarHorariosTrabajadorControlador');
const EHARutas = require('../../controlador/horarios/EditarHorarioControlador');
const EHRutas = require('../../controlador/admin/EliminarHorariosAdminControlador');
const ETRutas = require('../../controlador/admin/EliminarTrabajadorAdminControlador');
const ECRutas = require('../../controlador/admin/EliminarClienteAdminControlador');
const MCRutas = require('../../controlador/admin/DesactivarClienteControlador');
const MTRutas = require('../../controlador/admin/DesactivarTrabajadorControlador');
const ATRutas = require('../../controlador/admin/ActivarTrabajadorControlador');
const ACRutas = require('../../controlador/admin/ActivarClienteControlador');
const MARutas = require('../../controlador/admin/DesactivarAdminControlador');
const AARutas = require('../../controlador/admin/ActivarAdminControlador');

const router = express.Router();

router.post('/seguridad/crearcliente', CRutas.crearCliente);//RF01
router.post('/seguridad/creartrabajador', TRutas.crearTrabajador);//RF04
router.post('/seguridad/crearadmin', ARutas.crearAdmin);
router.post('/seguridad/login', LRutas.validarCredencial);
router.get('/seguridad/horarios', HRutas.consultarHorarios);
router.get('/seguridad/horarios/:idtrabajador', HRutas.consultarHorariosTrabajador);
router.put('/seguridad/horarios/:idhorario', EHARutas.editarHorario);//RF11
router.delete('/seguridad/horarios/:idhorario', EHRutas.eliminarHorario);//RF12
router.delete('/seguridad/trabajadores/:idtrabajador', ETRutas.eliminarTrabajador);//RF13
router.delete('/seguridad/clientes/:idcliente', ECRutas.eliminarCliente);//RF14
router.put('/seguridad/desactivarcliente/:id', MCRutas.modificarestado);
router.put('/seguridad/desactivartrabajador/:id', MTRutas.modificarestado);
router.put('/seguridad/activartrabajador/:id', ATRutas.modificarestado);
router.put('/seguridad/activarcliente/:id', ACRutas.modificarestado);
router.put('/seguridad/desactivaradmin/:id', MARutas.modificarestado);
router.put('/seguridad/activaradmin/:id', AARutas.modificarestado);

module.exports = router;