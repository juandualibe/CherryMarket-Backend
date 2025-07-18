const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();

// Endpoint de Registro: /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Guardar el nuevo usuario en la BD (por defecto tendrá el rol 'cashier')
        const sql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
        const { rows } = await db.query(sql, [username, password_hash]);

        res.status(201).json({ message: 'Usuario registrado exitosamente.', user: rows[0] });

    } catch (error) {
        // Manejar error de usuario duplicado
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Endpoint de Login: /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        // Buscar al usuario
        const sql = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(sql, [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Comparar la contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Crear y firmar el token JWT, AHORA INCLUYENDO EL ROL
        const payload = { 
            userId: user.id, 
            username: user.username,
            role: user.role // Aquí se añade el rol
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso.', token });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;