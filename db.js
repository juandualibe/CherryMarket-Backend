const mysql = require('mysql2');

// Crea el "pool" de conexiones a la base de datos
const pool = mysql.createPool({
    host: 'localhost', // O la IP de tu servidor de BD
    user: 'root',      // Tu usuario de MySQL (usualmente 'root')
    password: 'root', // La contraseña que pusiste al instalar MySQL
    database: 'cherry_market_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos la promesa del pool para poder usarla en otras partes de la aplicación
module.exports = pool.promise();