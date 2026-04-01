import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Augment Express Request with a user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header && header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret") as any;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}