import jwt from "jsonwebtoken";
export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies || {};
  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.id) {
      req.user = { id: decoded.id };
    }
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: error.message });
  }
};
