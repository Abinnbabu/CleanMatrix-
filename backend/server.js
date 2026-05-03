const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "models", ".env") });

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/bins", require("./routes/binRoutes"));

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});