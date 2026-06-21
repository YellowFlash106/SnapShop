const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization header"
        })
    }
    try {

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        })
    }
}

module.exports = protect;