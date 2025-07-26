// backend/services/reports.service.js
const db = require('../db'); // Importa el pool de conexiones a la base de datos

// Obtiene estadísticas para el dashboard
const getDashboardStats = async () => {
  // Consulta las ventas totales de hoy
  const salesQuery = `
    SELECT COALESCE(SUM(total_amount), 0) AS total_sales_today
    FROM sales
    WHERE (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date = (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  `;
  const salesResult = await db.query(salesQuery); // Ejecuta la consulta
  const totalSalesToday = salesResult.rows[0].total_sales_today;

  // Consulta la cantidad de productos con stock bajo
  const lowStockQuery = 'SELECT COUNT(*) AS low_stock_count FROM products WHERE stock < 10';
  const lowStockResult = await db.query(lowStockQuery); // Ejecuta la consulta
  const lowStockCount = lowStockResult.rows[0].low_stock_count;

  return {
    totalSalesToday: parseFloat(totalSalesToday), // Convierte a número decimal
    lowStockCount: parseInt(lowStockCount, 10), // Convierte a entero
  }; // Devuelve las estadísticas
};

// Obtiene un resumen de ventas por fechas
const getSalesSummary = async (startDate, endDate) => {
  const query = `
    SELECT
      (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as date,
      SUM(total_amount) as total
    FROM sales
    WHERE
      (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date BETWEEN $1::date AND $2::date
    GROUP BY (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
    ORDER BY (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date ASC;
  `; // Consulta las ventas agrupadas por día
  const { rows } = await db.query(query, [startDate, endDate]); // Ejecuta la consulta
  return rows; // Devuelve el resumen
};

// Obtiene los productos más vendidos
const getTopSellingProducts = async (limit = 5) => {
  const query = `
    SELECT p.name, SUM(si.quantity) AS total_sold
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    GROUP BY p.name
    ORDER BY total_sold DESC
    LIMIT $1;
  `; // Consulta los productos más vendidos, limitados por el parámetro
  const { rows } = await db.query(query, [limit]); // Ejecuta la consulta
  return rows; // Devuelve los productos
};

// Exporta los métodos del servicio
module.exports = {
  getDashboardStats,
  getSalesSummary,
  getTopSellingProducts,
};