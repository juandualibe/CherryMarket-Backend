// backend/routes/auth.routes.js
const express = require('express'); // Importa Express para definir rutas
const bcrypt = require('bcryptjs'); // Importa bcrypt para hashear contraseñas
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken para generar tokens JWT
const db = require('../db'); // Importa el pool de conexiones a la base de datos

const router = express.Router(); // Crea un enrutador de Express

// Endpoint de Registro: /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body; // Extrae usuario y contraseña del cuerpo de la solicitud

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' }); // Valida los campos
  }

  try {
    // Hashea la contraseña
    const salt = await bcrypt.genSalt(10); // Genera un salt con 10 rondas
    const password_hash = await bcrypt.hash(password, salt); // Hashea la contraseña

    // Guarda el nuevo usuario en la base de datos (rol por defecto: 'cashier')
    const sql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
    const { rows } = await db.query(sql, [username, password_hash]); // Ejecuta la consulta

    res.status(201).json({ message: 'Usuario registrado exitosamente.', user: rows[0] }); // Devuelve el usuario creado
  } catch (error) {
    // Maneja error de usuario duplicado
    if (error.code === '23505') {
      return res.status(409).json({ message: 'El nombre de usuario ya existe.' }); // Error de clave única
    }
    console.error('Error en registro:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja otros errores
  }
});

// Endpoint de Login: /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Extrae usuario y contraseña del cuerpo de la solicitud

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' }); // Valida los campos
  }

  try {
    // Busca al usuario en la base de datos
    const sql = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await db.query(sql, [username]); // Ejecuta la consulta
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // Maneja usuario no encontrado
    }

    // Compara la contraseña proporcionada con la hasheada
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // Maneja contraseña incorrecta
    }

    // Crea y firma el token JWT
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role, // Incluye el rol en el payload
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Firma el token con secreto y expiración

    res.json({ message: 'Inicio de sesión exitoso.', token }); // Devuelve el token
  } catch (error) {
    console.error('Error en login:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
});

// Exporta el enrutador
module.exports = router;