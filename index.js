const express = require('express');
const cors = require('cors');
const db = require('./db'); 

// Nuevos imports
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const authMiddleware = require('./authMiddleware');
const salesRoutes = require('./sales');

const app = express();
const PORT = 5000;

const whitelist = [
    'http://localhost:3000',
    'https://cherry-market-frontend.vercel.app' // Asegúrate de que esta sea tu URL de Vercel
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

// --- Rutas Públicas (no requieren token) ---
app.get('/', (req, res) => {
  res.send('¡El servidor Cherry Market está funcionando!');
});
app.use('/api/auth', authRoutes);

// --- Rutas Protegidas (requieren token) ---
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Obtener todos los productos
app.get('/api/products', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM products ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo producto
app.post('/api/products', authMiddleware, async (req, res) => {
    const { name, price, stock, barcode } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const sql = 'INSERT INTO products (name, price, stock, barcode) VALUES ($1, $2, $3, $4) RETURNING id';
        const { rows } = await db.query(sql, [name, price, stock || 0, barcode || null]);
        res.status(201).json({ 
            message: 'Producto creado exitosamente',
            productId: rows[0].id 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un producto existente
app.put('/api/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, price, stock, barcode } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const sql = 'UPDATE products SET name = $1, price = $2, stock = $3, barcode = $4 WHERE id = $5';
        const { rowCount } = await db.query(sql, [name, price, stock, barcode, id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un producto
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM products WHERE id = $1';
        const { rowCount } = await db.query(sql, [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Registrar una nueva venta
app.use('/api/sales', authMiddleware, salesRoutes);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});