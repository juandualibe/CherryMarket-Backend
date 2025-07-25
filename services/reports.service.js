const db = require('../db');

const getDashboardStats = async () => {
    const salesQuery = `
        SELECT COALESCE(SUM(total_amount), 0) AS total_sales_today
        FROM sales
        WHERE (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date = (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
    `;
    const salesResult = await db.query(salesQuery);
    const totalSalesToday = salesResult.rows[0].total_sales_today;

    const lowStockQuery = 'SELECT COUNT(*) AS low_stock_count FROM products WHERE stock < 10';
    const lowStockResult = await db.query(lowStockQuery);
    const lowStockCount = lowStockResult.rows[0].low_stock_count;

    return {
        totalSalesToday: parseFloat(totalSalesToday),
        lowStockCount: parseInt(lowStockCount, 10),
    };
};

const getSalesSummary = async (startDate, endDate) => {
    const query = `
        SELECT
            TO_CHAR(sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires', 'DD/MM') as date,
            SUM(total_amount) as total
        FROM sales
        WHERE
            (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date BETWEEN $1::date AND $2::date
        GROUP BY date
        ORDER BY TO_DATE(date, 'DD/MM') ASC; -- CORRECCIÓN AQUÍ
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    return rows;
};

const getTopSellingProducts = async (limit = 5) => {
    const query = `
        SELECT p.name, SUM(si.quantity) AS total_sold
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY p.name
        ORDER BY total_sold DESC
        LIMIT $1;
    `;
    const { rows } = await db.query(query, [limit]);
    return rows;
};

module.exports = {
    getDashboardStats,
    getSalesSummary,
    getTopSellingProducts,
};