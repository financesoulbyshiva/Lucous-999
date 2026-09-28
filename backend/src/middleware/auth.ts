import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

export interface JwtAuthPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifyRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  expectedRole: string
): void | Response {
  const rawHeader = req.headers.authorization;
  const header = typeof rawHeader === "string" ? rawHeader : "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtAuthPayload;

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

export function requireStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  return verifyRole(req, res, next, "STUDENT");
}

export function requireTeacher(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  return verifyRole(req, res, next, "TEACHER");
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const rawHeader = req.headers.authorization;
  const header = typeof rawHeader === "string" ? rawHeader : "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtAuthPayload;
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    authenticate(req, res, () => {
      if (!req.role || !roles.includes(req.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      next();
    });
  };
}
