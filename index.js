const express = require('express');
const cors = require('cors');
const db = require('./db');

// Imports de rutas
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const salesRoutes = require('./sales');
const reportRoutes = require('./reports');
const categoriesRoutes = require('./categories');

// Middlewares
const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');

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


// --- Rutas Públicas ---
app.get('/', (req, res) => res.send('¡El servidor Cherry Market está funcionando!'));
app.use('/api/auth', authRoutes);


// --- Rutas Protegidas (Para cualquier usuario logueado, INCLUIDO CAJERO) ---
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);

// Ver productos y categorías es para todos los logueados
app.get('/api/products', authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name ASC;
        `;
        const { rows } = await db.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// AÑADIMOS ESTA RUTA PARA QUE EL CAJERO PUEDA VER LAS CATEGORÍAS EN EL POS
app.get('/api/categories', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// --- Rutas Protegidas (SOLO PARA ADMINS) ---
app.use('/api/reports', authMiddleware, roleMiddleware, reportRoutes);
// La GESTIÓN de categorías (crear, editar, borrar) es solo para admins
app.use('/api/categories', authMiddleware, roleMiddleware, categoriesRoutes);

// Crear, actualizar y eliminar productos solo puede hacerlo un admin
app.post('/api/products', authMiddleware, roleMiddleware, async (req, res) => {
    const { name, price, stock, barcode, category_id } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const sql = 'INSERT INTO products (name, price, stock, barcode, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const { rows } = await db.query(sql, [name, price, stock || 0, barcode || null, category_id || null]);
        res.status(201).json({
            message: 'Producto creado exitosamente',
            productId: rows[0].id
        });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

app.put('/api/products/:id', authMiddleware, roleMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, price, stock, barcode, category_id } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const sql = 'UPDATE products SET name = $1, price = $2, stock = $3, barcode = $4, category_id = $5 WHERE id = $6';
        const { rowCount } = await db.query(sql, [name, price, stock, barcode, category_id || null, id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM products WHERE id = $1';
        const { rowCount } = await db.query(sql, [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});