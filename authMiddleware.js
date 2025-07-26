// backend/authMiddleware.js
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken para verificar tokens JWT

// Middleware para autenticar solicitudes
module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrae el token del encabezado Authorization

  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada.' }); // Valida la presencia del token
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token con el secreto
    req.user = decoded; // Añade los datos decodificados al objeto request
    next(); // Continúa con el siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ message: 'El token no es válido.' }); // Maneja tokens inválidos
  }
};