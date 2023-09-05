const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
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

  req.userId = verifToken.userId;
  next();
};
