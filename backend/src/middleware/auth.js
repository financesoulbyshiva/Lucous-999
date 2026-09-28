const jwt = require("jsonwebtoken");
const env = require("../config/env");

function verifyRole(req, res, next, expectedRole) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (payload.role !== expectedRole) {
      return res
        .status(403)
        .json({ success: false, message: `${expectedRole.toLowerCase()} access only` });
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

function requireStudent(req, res, next) {
  return verifyRole(req, res, next, "STUDENT");
}

function requireTeacher(req, res, next) {
  return verifyRole(req, res, next, "TEACHER");
}

// General JWT auth: verifies the Bearer token and attaches userId + role.
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

// Role gate built on authenticate.
function requireRole(...roles) {
  return (req, res, next) =>
    authenticate(req, res, () => {
      if (!roles.includes(req.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      next();
    });
}

module.exports = {
  authenticate,
  requireRole,
  requireStudent,
  requireTeacher,
  verifyRole,
};
