const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  // 'DB_PASSWORD',
  "DB_NAME",
];

// Validar las variables requeridas.
const faltantes = requiredEnvVars.filter(
  (key) => process.env[key] === undefined || process.env[key] === "",
);

if (faltantes.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${faltantes.join(", ")}`,
  );
}

// Validar el puerto.
const puerto = Number(process.env.DB_PORT);

if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error("DB_PORT debe ser un puerto válido.");
}

const dbConfig = {
  host: process.env.DB_HOST,
  port: puerto,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "", // Si no se proporciona, se establece como cadena vacía
  database: process.env.DB_NAME,
};

module.exports = dbConfig;
