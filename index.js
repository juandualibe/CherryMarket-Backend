const express = require('express');
const cors = require('cors');
const db = require('./db'); // Importamos nuestra conexión a la BD

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Endpoint de prueba (lo dejamos para verificar que el server funciona)
app.get('/', (req, res) => {
  res.send('¡El servidor Cherry Market está funcionando!');
});

// --- NUEVO ENDPOINT ---
// Obtener todos los productos
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products'); // Hacemos la consulta a la BD
        res.json(rows); // Enviamos el resultado como JSON
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Nuevo Endpoint (POST)
// CREAR UN NUEVO PRODUCTO
app.post('/api/products', async (req, res) => {
    // Obtenemos los datos del nuevo producto del cuerpo de la solicitud
    const { name, price, stock, barcode } = req.body;

    // Validación básica: nos aseguramos de que el nombre y el precio existan
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }

    try {
        const sql = 'INSERT INTO products (name, price, stock, barcode) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, price, stock || 0, barcode || null]);
        
        // Devolvemos una respuesta de éxito con el ID del nuevo producto
        res.status(201).json({ 
            message: 'Producto creado exitosamente',
            productId: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// --- NUEVO ENDPOINT ---
// Actualizar un producto existente
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de los parámetros de la ruta
    const { name, price, stock, barcode } = req.body; // Obtenemos los datos a actualizar

    // Validación básica
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }

    try {
        const sql = 'UPDATE products SET name = ?, price = ?, stock = ?, barcode = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, price, stock, barcode, id]);

        // Si la consulta no afectó a ninguna fila, significa que el producto no existe
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// --- NUEVO ENDPOINT ---
// Eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de la ruta

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

// --- NUEVO ENDPOINT PARA REGISTRAR VENTAS ---
app.post('/api/sales', async (req, res) => {
    // El frontend nos enviará un array de productos en el carrito y el total
    const { cart, total } = req.body;

    if (!cart || cart.length === 0 || !total) {
        return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    let connection;
    try {
        // Obtenemos una conexión del pool para manejar la transacción
        connection = await db.getConnection();
        // Iniciamos la transacción
        await connection.beginTransaction();

        // 1. Insertamos la venta en la tabla 'sales'
        const saleSql = 'INSERT INTO sales (total_amount) VALUES (?)';
        const [saleResult] = await connection.query(saleSql, [total]);
        const saleId = saleResult.insertId;

        // 2. Preparamos las consultas para cada item del carrito
        const saleItemsPromises = cart.map(item => {
            // Insertamos cada item en 'sale_items'
            const itemSql = 'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)';
            connection.query(itemSql, [saleId, item.id, item.quantity, item.price]);

            // Actualizamos el stock en la tabla 'products'
            const stockSql = 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?';
            return connection.query(stockSql, [item.quantity, item.id, item.quantity]);
        });

        // Ejecutamos todas las promesas de los items
        const results = await Promise.all(saleItemsPromises);

        // Verificamos si alguna actualización de stock falló (por no haber suficiente)
        for (const result of results) {
            if (result[0].affectedRows === 0) {
                // Si un producto no se pudo actualizar, lanzamos un error para cancelar todo
                throw new Error('Stock insuficiente para uno de los productos.');
            }
        }

        // 3. Si todo salió bien, confirmamos la transacción
        await connection.commit();
        res.status(201).json({ message: 'Venta registrada exitosamente', saleId: saleId });

    } catch (error) {
        // 4. Si algo falló, revertimos todos los cambios
        if (connection) await connection.rollback();
        console.error('Error al registrar la venta:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor' });
    } finally {
        // 5. Siempre liberamos la conexión al final
        if (connection) connection.release();
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});