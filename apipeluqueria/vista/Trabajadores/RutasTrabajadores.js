const express = require("express");
const LTRutas = require("../../controlador/trabajadores/LoginTrabajadorControlador");
const HRutas = require("../../controlador/trabajadores/VerHorarioControlador");
const EdHRutas = require("../../controlador/trabajadores/EditarHorarioControlador");
const ElHRutas = require("../../controlador/trabajadores/EliminarHorarioControlador");

const router = express.Router();

router.post("/trabajador/login", LTRutas.validarCredencial); //RF5
router.get("/trabajador/horariot/:id", HRutas.buscarTodo); //RF8.1
router.get("/trabajador/horariod/:id&:fecha", HRutas.obtenerHorarioDia); //RF8.2
router.get("/trabajador/horarioe/:id&:fecha&:est", HRutas.obtenerHorarioEstado); //RF8.3
router.put("/trabajador/horarios/:idhorario", EdHRutas.editarHorario); //RF09
router.delete("/trabajador/horarios/:idhorario", ElHRutas.eliminarHorario); //RF10

module.exports = router;
