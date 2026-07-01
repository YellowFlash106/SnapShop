const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const permissions = require("../constants/permissions");

const { assignPermissionsToRole, 
        getPermissionsByRoleId, 
        removePermissionFromRole, 
        replaceRolePermissions } = require("../controllers/rolePermission.controller");

router.post("/:roleId/permissions", auth, authorize(permissions.ASSIGN_PERMISSIONS), assignPermissionsToRole);
router.get("/:roleId/permissions", auth, authorize(permissions.VIEW_PERMISSIONS), getPermissionsByRoleId);
router.delete("/:roleId/permissions/:permissionId", auth, authorize(permissions.REMOVE_PERMISSIONS), removePermissionFromRole);
router.put("/:roleId/permissions", auth, authorize(permissions.REPLACE_PERMISSIONS), replaceRolePermissions);
module.exports = router;
