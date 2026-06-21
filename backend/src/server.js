const express = require("express");
const cors = require("cors");


const app = express();
const authRouter = require("./routes/auth.route")

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "SnapShop API Runing"
    });
})

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
