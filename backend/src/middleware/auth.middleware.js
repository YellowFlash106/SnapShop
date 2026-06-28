const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (cookieToken) {
        token = cookieToken;
    } else {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        })
    }
    try {
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