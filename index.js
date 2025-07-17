const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const PORT = 5000;

// --- CONFIGURACIÓN DE CORS ---
// Reemplaza el app.use(cors()) simple con este bloque
const whitelist = [
    'http://localhost:3000', // Permite tu entorno local de React
    // Cuando despliegues el frontend, aquí irá la URL de Vercel
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
// --- FIN DE LA CONFIGURACIÓN DE CORS ---

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡El servidor Cherry Market está funcionando!');
});

// Obtener todos los productos
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo producto
app.post('/api/products', async (req, res) => {
    const { name, price, stock, barcode } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const sql = 'INSERT INTO products (name, price, stock, barcode) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, price, stock || 0, barcode || null]);
        res.status(201).json({ 
            message: 'Producto creado exitosamente',
            productId: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un producto existente
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, stock, barcode } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const sql = 'UPDATE products SET name = ?, price = ?, stock = ?, barcode = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, price, stock, barcode, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM products WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Registrar una nueva venta
app.post('/api/sales', async (req, res) => {
    const { cart, total } = req.body;
    if (!cart || cart.length === 0 || !total) {
        return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const saleSql = 'INSERT INTO sales (total_amount) VALUES (?)';
        const [saleResult] = await connection.query(saleSql, [total]);
        const saleId = saleResult.insertId;

        const saleItemsPromises = cart.map(item => {
            const itemSql = 'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)';
            connection.query(itemSql, [saleId, item.id, item.quantity, item.price]);
            const stockSql = 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?';
            return connection.query(stockSql, [item.quantity, item.id, item.quantity]);
        });
        
        const results = await Promise.all(saleItemsPromises);

        for (const result of results) {
            if (result[0].affectedRows === 0) {
                throw new Error('Stock insuficiente para uno de los productos.');
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Venta registrada exitosamente', saleId: saleId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al registrar la venta:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor' });
    } finally {
        if (connection) connection.release();
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});