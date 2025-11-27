const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const header_token = req.headers["authorization"];
  if (!header_token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }
  try {
    const tokenString = header_token.split(" ")[1];
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token not valid, authorization denied" });
  }
};
