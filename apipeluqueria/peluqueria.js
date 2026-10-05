const express = require('express');
const cors = require('cors');
const rutaadmin = require('./vista/admin/RutasAdmin');
const rutacliente = require('./vista/clientes/RutasClientes');
const rutatrabajadores = require('./vista/Trabajadores/RutasTrabajadores.js');
const rutahorarios = require('./vista/horarios/RutasHorarios');
const rutacitas = require('./vista/citas/RutasCitas');

// const rutaAdmin = require('./vista/AdminRutas');

const app = express();
const PORT = process.env.PORT || 3333;

// ---------- Middlewares ----------
app.use(cors({
  origin: '*', // Cambiar a: ['http://guillodelapena.xo.je/evidencias/', 'http://yo.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Rutas ----------
app.use('/', rutaadmin);
app.use('/', rutacliente);   
app.use('/', rutatrabajadores);
app.use('/', rutahorarios);
app.use('/', rutacitas);

// app.use('/seguridad', rutaAdmin);

app.get('/', (req, res) => {
  res.send('¡Hola desde mi servidor node.js!');
});

// ---------- Iniciar servidor ----------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});