const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

router.get('/sales-summary', reportsController.getSalesSummary);
router.get('/top-selling-products', reportsController.getTopSellingProducts);

module.exports = router;