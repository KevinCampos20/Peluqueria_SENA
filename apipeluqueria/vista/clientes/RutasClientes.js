const express = require("express");
const CRutas = require("../../controlador/clientes/CrearClienteControlador"); //RF02
const LCRutas = require("../../controlador/clientes/LoginClienteControlador"); //RF03
const DCRutas = require("../../controlador/clientes/DesactivarClienteControlador"); //RF22

const router = express.Router();

router.post("/usuario/crear", CRutas.crearCliente); //RF02
router.post("/cliente/login", LCRutas.validarCredencial); //RF03
router.put("/usuario/desactivar/:idcliente", DCRutas.desactivarCuenta); //RF22

module.exports = router;
