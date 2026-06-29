const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const buildAddressLine = (addressLine, addressLine1, addressLine2) => {
    if (typeof addressLine === 'string' && addressLine.trim()) {
        return addressLine.trim();
    }

    return [addressLine1, addressLine2]
        .filter((line) => typeof line === 'string' && line.trim())
        .map((line) => line.trim())
        .join(', ');
};

const createAddress = asyncHandler(async (req, res) => {
    const {
        fullName,
        phone,
        addressLine,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        landmark,
        isDefault,
    } = req.body;

    const normalizedAddressLine = buildAddressLine(addressLine, addressLine1, addressLine2);

    if (!fullName || !phone || !normalizedAddressLine || !city || !state || !country || !postalCode) {
        throw new ApiError(400, 'Missing required address fields');
    }

    const address = await prisma.address.create({
        data: {
            fullName,
            phone,
            addressLine: normalizedAddressLine,
            city,
            state,
            country,
            postalCode,
            landmark: landmark || null,
            isDefault: Boolean(isDefault),
            userId: req.user.id,
        },
    });

    return res.status(201).json(
        new ApiResponse(201, 'Address created successfully', address)
    );
});

const getAddresses = asyncHandler(async (req, res) => {
    const address = await prisma.address.findMany({
        where: {
            userId: req.user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Address fetched successfully', address)
    );
});

const getAddressById = asyncHandler(async (req, res) => {
    const addressId = Number(req.params.id);

    if (!Number.isInteger(addressId)) {
        throw new ApiError(400, 'Invalid address ID');
    }

    const address = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId: req.user.id,
        },
    });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    return res.status(200).json(
        new ApiResponse(200, 'Address fetched successfully', address)
    );
});

const updateAddress = asyncHandler(async (req, res) => {
    const addressId = Number(req.params.id);

    if (!Number.isInteger(addressId)) {
        throw new ApiError(400, 'Invalid address ID');
    }

    const existingAddress = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId: req.user.id,
        },
    });

    if (!existingAddress) {
        throw new ApiError(404, 'Address not found');
    }

    const { fullName, phone, addressLine, addressLine1, addressLine2, city, state, country, postalCode, landmark, isDefault } = req.body;
    const normalizedAddressLine = buildAddressLine(addressLine, addressLine1, addressLine2);

    const address = await prisma.address.update({
        where: { id: addressId },
        data: {
            fullName: fullName ?? existingAddress.fullName,
            phone: phone ?? existingAddress.phone,
            addressLine: normalizedAddressLine || existingAddress.addressLine,
            city: city ?? existingAddress.city,
            state: state ?? existingAddress.state,
            country: country ?? existingAddress.country,
            postalCode: postalCode ?? existingAddress.postalCode,
            landmark: landmark === undefined ? existingAddress.landmark : landmark,
            isDefault: isDefault === undefined ? existingAddress.isDefault : Boolean(isDefault),
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Address updated successfully', address)
    );
});

const deleteAddress = asyncHandler(async (req, res) => {
    const addressId = Number(req.params.id);

    if (!Number.isInteger(addressId)) {
        throw new ApiError(400, 'Invalid address ID');
    }

    const existingAddress = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId: req.user.id,
        },
    });

    if (!existingAddress) {
        throw new ApiError(404, 'Address not found');
    }

    await prisma.address.delete({
        where: { id: addressId },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Address deleted successfully')
    );
});

module.exports = { createAddress, getAddresses, getAddressById, updateAddress, deleteAddress }