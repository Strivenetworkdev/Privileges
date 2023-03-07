const mongoose = require("mongoose");
const express = require("express");
const app = express();
const privilegeRoutes = require('./Routes/privilegeRoutes')


mongoose.connect("mongodb://localhost:27017/privilegeDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

// Register privilege routes
app.use("/privileges", privilegeRoutes);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
