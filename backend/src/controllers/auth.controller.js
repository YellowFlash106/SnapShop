const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


const registerUser = asyncHandler(async (req, res) => {
    let { name, email, password } = req.body;

    email = email?.trim().toLowerCase();
    name = name?.trim();

    if (!name || !email || !password) {
        throw new ApiError(400, "Please provide name, email and password");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser) {
        throw new ApiError(400, "Email already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    const token = generateToken(user.id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", { user, token })
    );
});


const loginUser = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
        },
    });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user.id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    delete user.password;

    return res.status(200).json(
        new ApiResponse(200, "Logged in successfully", { token, user })
    );
});


const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token");

    return res.status(200).json(
        new ApiResponse(200, "Logged out successfully")
    );
});


module.exports = { registerUser, loginUser, logoutUser };