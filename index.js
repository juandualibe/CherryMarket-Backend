// backend/index.js
const express = require('express'); // Importa Express para crear el servidor
const cors = require('cors'); // Importa CORS para permitir solicitudes de otros dominios
require('./db'); // Importa la configuración de la base de datos

// Importa las rutas
const authRoutes = require('./routes/auth.routes'); // Rutas de autenticación
const dashboardRoutes = require('./routes/dashboard.routes'); // Rutas del dashboard
const salesRoutes = require('./routes/sales.routes'); // Rutas de ventas
const reportRoutes = require('./routes/reports.routes'); // Rutas de reportes
const categoriesRoutes = require('./routes/categories.routes'); // Rutas de categorías
const productRoutes = require('./routes/products.routes'); // Rutas de productos

// Importa el middleware de autenticación
const authMiddleware = require('./authMiddleware');

const app = express(); // Crea una instancia de Express
const PORT = process.env.PORT || 5000; // Define el puerto (de entorno o por defecto 5000)

// Configuración de CORS
const whitelist = [
  'http://localhost:3000',
  'https://cherry-market-frontend.vercel.app',
]; // Lista de dominios permitidos
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true); // Permite la solicitud si el origen está en la lista blanca
    } else {
      callback(new Error('Not allowed by CORS')); // Rechaza la solicitud si no está permitido
    }
  },
  optionsSuccessStatus: 200, // Código de estado para solicitudes OPTIONS
};
app.use(cors(corsOptions)); // Aplica el middleware CORS
app.use(express.json()); // Habilita el parseo de cuerpos JSON

// --- Carga de Rutas ---

// Ruta pública para verificar el estado del servidor
app.get('/', (req, res) => res.send('¡El servidor Cherry Market está funcionando!'));

// Rutas públicas (no requieren autenticación)
app.use('/api/auth', authRoutes); // Monta las rutas de autenticación

// Aplica el middleware de autenticación a todas las rutas siguientes
app.use(authMiddleware);

// Rutas protegidas (requieren token válido)
app.use('/api/dashboard', dashboardRoutes); // Monta las rutas del dashboard
app.use('/api/sales', salesRoutes); // Monta las rutas de ventas
app.use('/api/reports', reportRoutes); // Monta las rutas de reportes
app.use('/api/categories', categoriesRoutes); // Monta las rutas de categorías
app.use('/api/products', productRoutes); // Monta las rutas de productos

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Confirma que el servidor está activo
});