require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();
const authRouter = require("./routes/auth.route")
const productRouter = require("./routes/product.route")

const cartRouter = require("./routes/cart.route")

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", productRouter);

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

