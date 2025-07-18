const express = require('express');
const cors = require('cors');
const db = require('./db'); 

// Nuevos imports
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const authMiddleware = require('./authMiddleware');

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
app.post('/api/sales', authMiddleware, async (req, res) => {
    const { cart, total } = req.body;
    if (!cart || cart.length === 0 || !total) {
        return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const saleSql = 'INSERT INTO sales (total_amount) VALUES ($1) RETURNING id';
        const saleResult = await client.query(saleSql, [total]);
        const saleId = saleResult.rows[0].id;

        for (const item of cart) {
            const itemSql = 'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)';
            await client.query(itemSql, [saleId, item.id, item.quantity, item.price]);
            
            const stockSql = 'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1';
            const stockResult = await client.query(stockSql, [item.quantity, item.id]);

            if (stockResult.rowCount === 0) {
                throw new Error('Stock insuficiente para uno de los productos.');
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Venta registrada exitosamente', saleId: saleId });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message || 'Error interno del servidor' });
    } finally {
        client.release();
    }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});