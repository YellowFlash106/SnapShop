const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");


const registerUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        email = email?.trim().toLowerCase();
        name = name?.trim();

        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password",
            })
        }

        if(password.length < 6){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            })
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
            }
        })


        const token = generateToken(user.id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7, 

        })
        
        return res.status(201).json({
            success: true,
            user,
            token,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


const loginUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        email = email?.trim().toLowerCase();

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            })
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
            }
        })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = generateToken(user.id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7, 
        })

        delete user.password;

        res.status(200).json({
            success: true,
            token,
            user,
        })

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })

    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


module.exports = { registerUser, loginUser, logoutUser };