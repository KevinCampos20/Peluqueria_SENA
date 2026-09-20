const express = require('express');
const cors = require('cors');
const rutaCliente = require('./vista/admin/RutaCrearCliente');
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
app.use('/', rutaCliente);
// app.use('/seguridad', rutaAdmin);

app.get('/', (req, res) => {
  res.send('¡Hola desde mi servidor node.js!');
});

// ---------- Iniciar servidor ----------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});