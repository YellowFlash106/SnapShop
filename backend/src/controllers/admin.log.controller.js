const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const logRepository = require("../repositories/log.repository");


const getAllLogs = asyncHandler(async (req, res) => {
    try {

        const logs = await logRepository.getAllLogs();

        return res.status(200).json(
            new ApiResponse(200, "Logs fetched successfully", logs)
        );
        
    } catch (error) {
        throw new ApiError(500, "Failed to fetch logs");
    }
})

module.exports = { getAllLogs };