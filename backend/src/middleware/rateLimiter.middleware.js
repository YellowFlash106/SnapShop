const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max: 10, // 100
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

const authLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max: 2, // 5
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
})

module.exports = { globalLimiter, authLimiter };