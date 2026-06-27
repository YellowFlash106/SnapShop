const prisma = require('../config/prisma');

const buildAddressLine = (addressLine, addressLine1, addressLine2) => {
    if (typeof addressLine === 'string' && addressLine.trim()) {
        return addressLine.trim();
    }

    return [addressLine1, addressLine2]
        .filter((line) => typeof line === 'string' && line.trim())
        .map((line) => line.trim())
        .join(', ');
};

const createAddress = async (req, res) => {
    try {

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
            return res.status(400).json({
                success: false,
                message: 'Missing required address fields',
            });
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
        res.status(201).json({
            success: true,
            message: "Address created successfully",
            address,
        })
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            error: error.message 
        });

    }
}

const getAddresses = async (req, res) => {
    try {

        const address = await prisma.address.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return res.status(200).json({
            success: true,
            message: "Address fetched successfully",
            address,
        })

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            error: error.message 
        });
    }
}

const getAddressById = async (req, res) => {
    try {
        const addressId = Number(req.params.id);

        if(!Number.isInteger(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        const address = await prisma.address.findFirst({
            where: {
                id : addressId,
                userId: req.user.id,
            }
        })

        if(!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Address fetched successfully",
            address,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            error: error.message 
        });
    }
}

const updateAddress = async (req, res) => {
    try {
        const addressId = Number(req.params.id);

        if (!Number.isInteger(addressId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid address ID',
            });
        }

        const existingAddress = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId: req.user.id,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found',
            });
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

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            error: error.message 
        });
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = Number(req.params.id);

        if (!Number.isInteger(addressId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid address ID',
            });
        }

        const existingAddress = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId: req.user.id,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found',
            });
        }

        await prisma.address.delete({
            where: { id: addressId },
        });

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            error: error.message 
        });
    }
}

module.exports = { createAddress, getAddresses, getAddressById, updateAddress, deleteAddress }