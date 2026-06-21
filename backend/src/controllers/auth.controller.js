const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
            }
        })

        const token = generateToken(user.id);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
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
        const { name, email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        })
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            })
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = generateToken(user.id);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

module.exports = { registerUser, loginUser };