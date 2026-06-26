require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();
const authRouter = require("./routes/auth.route")
const productRouter = require("./routes/product.route")
const orderRouter = require("./routes/order.route")
const cartRouter = require("./routes/cart.route")
const { globalLimiter } = require('./middleware/rateLimiter.middleware')



app.use(express.json());
app.use(cors());
app.use(globalLimiter());

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "SnapShop API Runing"
    });
})

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

