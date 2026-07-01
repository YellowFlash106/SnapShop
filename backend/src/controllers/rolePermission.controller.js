const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const addPermissionsToRole = asyncHandler(async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;  

        const role = await prisma.role.findUnique({
            where: { id: Number(roleId) }
        });

        if (!role) {
            throw new ApiError(404, "Role not found");
        }

        const data = permissionIds.map((pid) => ({
            roleId: Number(roleId),
            permissionId: Number(pid)
        }));

        await prisma.rolePermission.createMany({
            data,
            skipDuplicates: true
        });

        return res.status(200).json(
            new ApiResponse(200, "Permissions added to role", null)
        );

    } catch (error) {
        next(error);
    }
});
 

const removePermissionFromRole = asyncHandler(async (req, res) => {
    try {
        const { roleId, permissionId } = req.params;

        await prisma.rolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId: Number(roleId),
                    permissionId: Number(permissionId)
                }
            }
        });

        return res.status(200).json(
            new ApiResponse(200, "Permission removed from role", null)
        );

    } catch (error) {
        next(error);
    }
});


const getRolePermissions = asyncHandler(async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await prisma.role.findUnique({
            where: { id: Number(roleId) },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        return res.status(200).json(
            new ApiResponse(200, "Role permissions fetched successfully", role.rolePermissions)
        );

    } catch (error) {
        next(error);
    }
});


const replaceRolePermissions = asyncHandler(async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;

        await prisma.rolePermission.deleteMany({
            where: {
                roleId: Number(roleId)
            }
        });

        const data = permissionIds.map(pid => ({
            roleId: Number(roleId),
            permissionId: Number(pid)
        }));

        await prisma.rolePermission.createMany({
            data
        });

        return res.status(200).json(
            new ApiResponse(200, "Role permissions updated", null)
        );

    } catch (error) {
        next(error);
    }
});


module.exports = {
    addPermissionsToRole,
    removePermissionFromRole,
    getRolePermissions,
    replaceRolePermissions
};   