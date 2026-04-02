import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const Middleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
    const authHeader = req.headers["authorization"];
    // authHeader: Bearer abc123xyz

    if (!authHeader) {
        return res.status(403).json({
        message: "Unauthorized",
        });
    }

    const parts = authHeader.split(" ");
    // ["Bearer", "abc123xyz"]

    if (parts.length !== 2 || parts[0] !== "Bearer") {//👉 Ensures: * First word = "Bearer" * Second = actual token
        return res.status(403).json({
        message: "Invalid token format",
        });
    }

    const token = parts[1];

    const decoded = jwt.verify(token as string, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
        return res.status(403).json({
        message: "Unauthorized",
        });
    }
    
    req.userId = decoded.userId;

    next();
    } catch (err) {
    return res.status(403).json({
        message: "Invalid or expired token",
    });
    }
};