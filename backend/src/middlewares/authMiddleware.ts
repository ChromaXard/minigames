import { Request, Response, NextFunction } from "express";

import { verifyToken } from "@/routes/auth/tokenTools";

import db from "@/db/global";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized: No access token provided." });
        }
        try {
            const decoded = await verifyToken(accessToken);
            if (!decoded) {
                return res.status(401).json({ message: "Unauthorized: Invalid or expired access token." });
            }
            (req as any).user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Invalid or expired access token." });
        }
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

async function confirmedMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticatedUser = (req as any).user;
        const result = await db.select({confirmed: usersTable.confirmed})
            .from(usersTable)
            .where(eq(usersTable.id, authenticatedUser.userId));
        if (result.length === 1) {
            const userData = result[0];
            if (userData.confirmed === false) {
                return res.status(403).json({ message: "Vous devez confirmer votre compte pour accéder à cette ressource." });
            }
            next();
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error("Error in confirmed middleware:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export { confirmedMiddleware, authMiddleware };