const ConnectToDatabase = require("./utils/db");
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = 5000;


require('dotenv').config();
const cors = require("cors");


ConnectToDatabase();
// Middlewares
app.use(
    cors({
        origin: "*",
        methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
        preflightContinue: true,
    })
);
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));


app.get("/isServerUp", async (req, res, next) => {
    console.log("hitted");
    res.status(200).send("Transport server online!");
});

const userRoutes = require("./routes/users");
// const vehicleRoutes = require("./routes/vehicle");


app.use("/users", userRoutes);
// app.use("/vehicle", vehicleRoutes);

// Error Handling Middleware For Other Error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});


app.listen(port, () => {
    console.log(`Transport Server is running on port http://localhost:${port}`);
})

module.exports = app;