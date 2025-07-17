require('dotenv').config();
const { Pool } = require('pg');

// La configuración cambia para usar el pool de 'pg'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render nos dará esta URL
  // En producción, Render requiere una conexión SSL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;