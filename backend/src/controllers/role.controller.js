const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createRole = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingRole = await prisma.role.findUnique({
            where: { name }
        });

        if (existingRole) {
            throw new ApiError(400, "Role already exists");
        }

        const role = await prisma.role.create({
            data: {
                name,
                description
            }
        });

        return res.status(201).json(
            new ApiResponse(201, "Role created successfully", role)
        );
    } catch (error) {
        next(error);
    }
});
           

const getAllRoles = asyncHandler(async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        return res.status(200).json(
            new ApiResponse(200, "Roles fetched successfully", roles)
        );

    } catch (error) {
        next(error);
    }
});


const getRoleById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const role = await prisma.role.findUnique({
            where: { id: Number(id) },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            throw new ApiError(404, "Role not found");
        }

        return res.status(200).json(
            new ApiResponse(200, "Role fetched successfully", role)
        );

    } catch (error) {
        next(error);
    }
});

const updateRole = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const role = await prisma.role.update({
            where: { id: Number(id) },
            data: {
                name,
                description
            }
        });

        return res.status(200).json(
            new ApiResponse(200, "Role updated successfully", role)
        );
    } catch (error) {
        next(error);
    }
});


const deleteRole = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.role.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json(
            new ApiResponse(200, "Role deleted successfully", null)
        );

    } catch (error) {
        next(error);
    }
});

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
};