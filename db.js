// backend/db.js
require('dotenv').config(); // Carga las variables de entorno desde .env
const { Pool } = require('pg'); // Importa el Pool de conexiones de PostgreSQL

// Configura el pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usa la URL de conexión proporcionada por el entorno
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Habilita SSL en producción
});

// Exporta el pool de conexiones
module.exports = pool;