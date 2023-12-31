const express = require("express");
const bodyParser = require("body-parser");
const app = express();

//body-parser
app.use(bodyParser.json()); // membaca application/json

const connectDb = require("./util/database").connectDb;

const adminRoutes = require("./routes/admin.js");
const productRoutes = require("./routes/products.js");
//setCors
const linkOrigin = ["http://localhost:3000", "https://amanone-app.vercel.app"];
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (linkOrigin.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    " PUT,POST, GET, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
// admin routes
app.use("/admin", adminRoutes);

//product routes
app.use(productRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const errorValidationMsg = error.errorValidationMsg;
  res.status(status).json({
    message: message,
    errorValidationMsg: errorValidationMsg,
  });
});

connectDb(() => {
  app.listen(process.env.PORT || 8080);
});
