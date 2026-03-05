import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const Middleware = (
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }
        
        // // Extract token from "Bearer <token>"
        // const token = token.split(" ")[1];
        
        // if (!token) {
        //     console.log(token);
        // return res.status(403).json({
        //     message: "Unauthorized",
        // });
        // }
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