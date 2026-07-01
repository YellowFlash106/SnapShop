const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const permissions = require("../constants/permissions");

const { createRole, getAllRoles, getRoleById, updateRole, deleteRole } = require("../controllers/role.controller");

router.post("/", auth, authorize(permissions.CREATE_ROLE), createRole);
router.get("/", auth, authorize(permissions.VIEW_ROLES), getAllRoles);
router.get("/:id", auth, authorize(permissions.VIEW_ROLES), getRoleById);
router.put("/:id", auth, authorize(permissions.UPDATE_ROLE), updateRole);

router.delete("/:id", auth, authorize(permissions.DELETE_ROLE), deleteRole);

module.exports = router;