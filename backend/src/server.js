require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ApiError = require("./utils/ApiError");


const app = express();

const errorMiddleware = require("./middleware/error.middleware");
const authRouter = require("./routes/auth.route")
const productRouter = require("./routes/product.route")
const orderRouter = require("./routes/order.route")
const cartRouter = require("./routes/cart.route")
const addressRouter = require("./routes/address.route")
const adminRouter = require("./routes/admin.route")
const adminReviewRouter = require("./routes/admin.review.route")
const reviewRouter = require("./routes/review.route")
const adminAnalyticsRouter = require("./routes/admin.analytics.route")
const adminInventoryRouter = require("./routes/admin.inventory.route")
const adminLogRouter = require("./routes/admin.log.route")


const { globalLimiter } = require('./middleware/rateLimiter.middleware')



app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(globalLimiter);

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/address", addressRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/reviews", adminReviewRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/inventory", adminInventoryRouter);
app.use("/api/admin/logs", adminLogRouter);
app.use("/api/reviews", reviewRouter);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "SnapShop API Runing"
    });
})

app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

