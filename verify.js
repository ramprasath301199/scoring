const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader)
    return res.status(200).json({ message: "Token required", status: 0 });
  const token = bearerHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
    if (err)
      return res.status(200).json({ message: "Invalid token", status: -1 });
    req.user = authData;
    next();
  });
}

module.exports = verifyToken;
