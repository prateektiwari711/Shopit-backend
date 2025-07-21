import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch {
    res.sendStatus(403);
  }
}

export default authenticateToken;
