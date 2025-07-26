const db = require('../db');
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');

// La zona horaria clave para todas las operaciones
const timeZone = 'America/Argentina/Buenos_Aires';

const getDashboardStats = async () => {
    // Obtenemos el inicio y fin del día actual en Argentina
    const nowInArgentina = utcToZonedTime(new Date(), timeZone);
    const startOfDayArg = format(nowInArgentina, 'yyyy-MM-dd 00:00:00', { timeZone });
    const endOfDayArg = format(nowInArgentina, 'yyyy-MM-dd 23:59:59', { timeZone });

    // Convertimos esas horas locales a UTC para consultar la base de datos
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
    // Convertimos las fechas de entrada a rangos UTC
    const startUTC = zonedTimeToUtc(startDate, timeZone);
    const endUTC = zonedTimeToUtc(`${endDate} 23:59:59`, timeZone);

    // Consulta simple que trae todas las ventas en el rango UTC
    const query = `
        SELECT sale_date, total_amount
        FROM sales
        WHERE sale_date BETWEEN $1 AND $2
        ORDER BY sale_date ASC;
    `;
    const { rows } = await db.query(query, [startUTC, endUTC]);

    // Agrupamos y sumamos en JavaScript
    const salesByDay = {};
    rows.forEach(sale => {
        const localDate = utcToZonedTime(sale.sale_date, timeZone);
        const dateKey = format(localDate, 'dd/MM');
        if (!salesByDay[dateKey]) {
            salesByDay[dateKey] = 0;
        }
        salesByDay[dateKey] += parseFloat(sale.total_amount);
    });

    // Convertimos el objeto al formato que espera el gráfico
    const formattedSales = Object.keys(salesByDay).map(date => ({
        date: date,
        total: salesByDay[date]
    }));

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