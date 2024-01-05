//API documentation packages
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require("swagger-jsdoc");

//Imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const asyncErrors = require("express-async-errors");

//security packages
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

//File Imports
const dbConnect = require("./config/db");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const errorMiddleware = require("./middllewares/errorMiddleware");

//config dotenv
const dotenv = require("dotenv").config();

// Swagger api config
// swagger api options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal Application",
      description: "Node Expressjs Job Portal Application",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const spec = swaggerDoc(options);

//Rest Object
const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(mongoSanitize());

//Route
app.get("/", (req, res) => {
  res.send("Welcome to Job portal");
});
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/jobs", jobsRoutes);

//homeroute root
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(spec));

app.use(errorMiddleware);

//Database Connection
dbConnect();

//Listen Port
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Node Server connected on port ${PORT}`);
});
