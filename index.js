const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const errorHandler = require("./helpers/error-handler");
const path = require("path");
const setupSocket = require("./socket");

require("dotenv/config");
const PORT = 3002;
const api = process.env.API_URL;

//Middleware
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(morgan("tiny")); //log requests
app.use(authJwt());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  "/public/assets",
  express.static(path.join(__dirname, "public", "assets"))
);

app.use(errorHandler);

//Router
const productRouter = require("./routers/products");
app.use(`${api}/products`, productRouter);

const categoryRouter = require("./routers/categories");
app.use(`${api}/categories`, categoryRouter);

const userRouter = require("./routers/users");
app.use(`${api}/users`, userRouter);

const orderRouter = require("./routers/orders");
app.use(`${api}/orders`, orderRouter);

//Database Connection
mongoose
  .connect(process.env.DB_CONNECTION, { dbName: "dbMongo" })
  .then(() => {
    console.log("Database Connection is ready.");
  })
  .catch((err) => {
    console.log(err);
  });

//Server setup
const server = app.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`);
});

setupSocket(server);
