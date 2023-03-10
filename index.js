const privilegeRoutes = require("./Routes/privilegeRoutes");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json())
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }));

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Register privilege routes
app.use("/privileges", privilegeRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
