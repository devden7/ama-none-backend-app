const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  const token = authHeader.split(" ")[1];
  const convertTokenToNull = token === "null";

  if (convertTokenToNull) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  let verifToken;
  try {
    verifToken = jwt.verify(token, "testjwtlogin");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!verifToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  if (verifToken.email !== "admin@admin.com") {
    const error = new Error("Invalid Admin Token");
    error.statusCode = 401;
    throw error;
  }

  req.userId = verifToken.userId;
  next();
};

const userAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  const token = authHeader.split(" ")[1];
  const convertTokenToNull = token === "null";

  if (convertTokenToNull) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  let verifToken;
  try {
    verifToken = jwt.verify(token, "testjwtlogin");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!verifToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  if (verifToken.email === "admin@admin.com") {
    const error = new Error("Eror User");
    error.statusCode = 401;
    throw error;
  }

  req.userId = verifToken.userId;
  next();
};

exports.authAdmin = adminAuth;
exports.authUser = userAuth;
