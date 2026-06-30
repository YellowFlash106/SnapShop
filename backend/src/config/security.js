const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const ratLimit = require('express-rate-limit');
const compression = require('compression');


const securityMiddleware = (app) => {
    app.use(
        helmet({
            crossOriginResourcePolicy: false,
        })
    );

    app.use(compression());
    app.use(hpp());

    app.use(
        cors({
            origin: process.env.CLIENT_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        })
    );

    app.use(ratLimit({
            windowMs: 15 * 60 * 1000, 
            max: 100, 
            standardHeaders: true,  
            legacyHeaders: false, 
            message: 'Too many requests from this IP, please try again later.',
        })
    );
}

module.exports = securityMiddleware;