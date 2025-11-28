import express from "express";
const router = express.Router();
export default router;

import {authMiddleware, confirmedMiddleware} from "@/middlewares/authMiddleware";
import db from "@/db/global";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getUserById(id: string) {
    if (!id || typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return null;
    }
    const result = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, id));
    if (result.length === 1) {
        return result[0];
    }
    return null;
}

router.route("/me")
    .get(authMiddleware, async (req, res) => {
        const authenticatedUser = (req as any).user;
        const userData = await getUserById(authenticatedUser.userId);
        if (userData) {
            res.status(200).json({
                user: {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    confirmed: userData.confirmed,
                    canDelete: true
                }
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });

router.route("/:id")
    .get(authMiddleware, confirmedMiddleware, async (req, res) => {
        const authenticatedUser = (req as any).user;
        const id = req.params.id;
        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid or missing user ID" });
        }
        console.log(`Fetching profile for userId: ${id}`);
        const result = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, id));
        if (result.length === 1) {
            const userData = result[0];
            if (userData.confirmed === false && authenticatedUser.userId !== userData.id) {
                return res.status(403).json({ message: "L'utilisateur n'a pas confirmé son compte." });
            }
            return res.status(200).json({
                user: {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    confirmed: userData.confirmed,
                    canDelete: authenticatedUser.userId === userData.id
                }
            })
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });