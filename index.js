const express = require('express');
const cors = require('cors');
require('./db');

// Imports de rutas
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const salesRoutes = require('./routes/sales.routes');
const reportRoutes = require('./routes/reports.routes');
const categoriesRoutes = require('./routes/categories.routes');
const productRoutes = require('./routes/products.routes');

// Middleware
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS
const whitelist = [
    'http://localhost:3000',
    'https://cherry-market-frontend.vercel.app'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());


// --- Carga de Rutas ---

// Rutas Públicas (no necesitan token)
app.get('/', (req, res) => res.send('¡El servidor Cherry Market está funcionando!'));
app.use('/api/auth', authRoutes);

// A partir de aquí, TODAS las rutas requieren un token válido
app.use(authMiddleware);

// Rutas Protegidas
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productRoutes);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});