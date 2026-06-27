import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agritradex_jwt_super_secret_2024_pk_cattle_marketplace_khalid';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

export default authMiddleware;
