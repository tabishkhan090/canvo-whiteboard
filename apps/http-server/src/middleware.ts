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

        if (!authHeader) {
        return res.status(403).json({
            message: "Unauthorized",
        });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        if (!token) {
        return res.status(403).json({
            message: "Unauthorized",
        });
        }
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.userId) {
        return res.status(403).json({
            message: "Unauthorized",
        });
        }
        // @ts-ignore
        // Attach userId to request
        req.userId = decoded.userId;

        next();
    } catch (err) {
        return res.status(500).json({
        message: "Something went wrong",
        });
    }
};