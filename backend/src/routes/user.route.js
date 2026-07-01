const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/authorize.middleware');
const permissions = require('../constants/permissions');
const isAdmin = require('../middleware/isAdmin.middleware');

const { getAllUsers, 
        updateUserRole, 
        getUserById, 
        getMyProfile } = require('../controllers/user.controller');


router.get("/", auth, isAdmin, authorize(permissions.VIEW_USERS), require('../controllers/user.controller').getAllUsers);
router.get("/:id", auth, isAdmin, authorize(permissions.VIEW_USERS), require('../controllers/user.controller').getUserById);
router.get("/profile", auth, authorize(permissions.VIEW_PROFILE), require('../controllers/user.controller').getMyProfile);
router.patch("/:id/role", auth, isAdmin, authorize(permissions.UPDATE_USER_ROLE), require('../controllers/user.controller').updateUserRole);

module.exports = router;