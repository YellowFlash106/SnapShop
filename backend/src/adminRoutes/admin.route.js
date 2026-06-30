const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth.middleware');
const { getDashboardOverview } = require('../controllers/admin.controller');

router.get("/dashboard", auth, getDashboardOverview);

module.exports = router;