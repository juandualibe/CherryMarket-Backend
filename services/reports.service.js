const db = require('../db');
// CORRECCIÓN: Importamos desde la librería correcta
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');

// La zona horaria clave para todas las operaciones
const timeZone = 'America/Argentina/Buenos_Aires';

const getDashboardStats = async () => {
    const nowInArgentina = utcToZonedTime(new Date(), timeZone);
    const startOfDayArg = new Date(nowInArgentina.getFullYear(), nowInArgentina.getMonth(), nowInArgentina.getDate());
    const endOfDayArg = new Date(startOfDayArg.getTime() + 24 * 60 * 60 * 1000 - 1);

    const startOfDayUTC = zonedTimeToUtc(startOfDayArg, timeZone);
    const endOfDayUTC = zonedTimeToUtc(endOfDayArg, timeZone);

    const salesQuery = `
        SELECT COALESCE(SUM(total_amount), 0) AS total_sales_today
        FROM sales
        WHERE sale_date BETWEEN $1 AND $2;
    `;
    const salesResult = await db.query(salesQuery, [startOfDayUTC, endOfDayUTC]);
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
    const startUTC = zonedTimeToUtc(startDate, timeZone);
    const endUTC = zonedTimeToUtc(`${endDate} 23:59:59`, timeZone);

    const query = `
        SELECT sale_date, total_amount
        FROM sales
        WHERE sale_date BETWEEN $1 AND $2
        ORDER BY sale_date ASC;
    `;
    const { rows } = await db.query(query, [startUTC, endUTC]);

    const salesByDay = {};
    rows.forEach(sale => {
        const localDate = utcToZonedTime(sale.sale_date, timeZone);
        const dateKey = format(localDate, 'dd/MM');
        if (!salesByDay[dateKey]) {
            salesByDay[dateKey] = 0;
        }
        salesByDay[dateKey] += parseFloat(sale.total_amount);
    });

    const formattedSales = Object.keys(salesByDay).map(date => ({
        date: date,
        total: salesByDay[date]
    })).sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA - dateB;
    });

    return formattedSales;
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