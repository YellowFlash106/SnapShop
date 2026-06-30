const express = require("express");
const router = express.Router();

const { getAllLogs } = require("../controllers/admin.log.controller");

router.get("/logs", getAllLogs);

module.exports = router;