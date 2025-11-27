import express from "express";
const router = express.Router();
export default router;

import { verifyEmail, verifyPassword, verifyUsername } from "./verifyTools";
import { hashPassword, comparePassword } from "./hashTools";
import db from "../../db/global";
import { usersTable } from "../../db/schema";
import { generateToken, deleteToken, verifyToken } from "./tokenTools";
import {authMiddleware} from "../../middlewares/authMiddleware";
import { eq } from "drizzle-orm";
import { sendConfirmationEmail } from "./authTools";

function parseRequestBody(req: express.Request, argsNeeded: {name: string, type: string}[]): Record<string, any> {
    const ret: Record<string, any> = {};
    for (const arg of argsNeeded) {
        const value = req.body[arg.name];
        if (value === undefined) {
            throw new Error(`Argument "${arg.name}" manquant.`);
        }
        if (typeof value !== arg.type) {
            throw new Error(`Type de l'argument "${arg.name}" invalide. Attendu: ${arg.type}, Reçu: ${typeof value}`);
        }
        ret[arg.name] = value;
    }
    if (Object.keys(ret).length !== argsNeeded.length) {
        throw new Error("Tout les arguments requis n'ont pas été fournis.");
    }
    return ret;
}

router.route("/verify")
    .get(authMiddleware, (req, res) => {
        res.status(200).json({ message: "User is authenticated." });
    });

router.route("/login")
    .post(async (req, res) => {
        let parsedBody: Record<string, any>;
        try {
            parsedBody =
            parseRequestBody(req, [
                { name: "username", type: "string" },
                { name: "password", type: "string" }
            ]);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
        const { username, password } = parsedBody;
        try {
            const result = await db.select().from(usersTable).where(eq(usersTable.username, username));
            if (result.length === 0) {
                return res.status(401).json({ message: "Invalid username or password." });
            }
            const user = result[0];
            const passwordMatch = comparePassword(password, user.passwordHash);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid username or password." });
            }
            const accessToken = await generateToken(user.id, username, "ACCESS");
            const refreshToken = await generateToken(user.id, username, "REFRESH");
            res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1 * 60 * 60 * 1000 /** 1 hour */ });
            res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 /** 7 days */ });
            return res.status(200).json({ message: "Login successful." });
        } catch (error) {
            console.error("Error during user login:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    });

router.route("/register")
    .post(async (req, res) => {
        let parsedBody: Record<string, any>;
        try {
            parsedBody =
            parseRequestBody(req, [
                { name: "username", type: "string" },
                { name: "email", type: "string" },
                { name: "password", type: "string" }
            ]);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
        try {
            await verifyUsername(parsedBody.username);
            await verifyEmail(parsedBody.email);
            verifyPassword(parsedBody.password);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
        const hashedPassword = hashPassword(parsedBody.password);
        try {
            const dbReturn = await db.insert(usersTable).values({
                username: parsedBody.username,
                email: parsedBody.email,
                passwordHash: hashedPassword
            }).returning({insertedId: usersTable.id, insertedUsername: usersTable.username});
            const { insertedId, insertedUsername } = dbReturn[0];
            const accessToken = await generateToken(insertedId, insertedUsername, "ACCESS");
            const refreshToken = await generateToken(insertedId, insertedUsername, "REFRESH");
            sendConfirmationEmail(parsedBody.email, insertedId, insertedUsername);
            res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1 * 60 * 60 * 1000 /** 1 hour */ });
            res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 /** 7 days */ });
            return res.status(201).json({ message: "User registered successfully." });
        } catch (error) {
            console.error("Error during user registration:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    });

router.route("/logout")
    .post(async (req, res) => {
        try {
            const accessToken = req.cookies?.accessToken;
            const refreshToken = req.cookies?.refreshToken;
            if (accessToken) {
                await deleteToken(accessToken);
                res.clearCookie("accessToken");
            }
            if (refreshToken) {
                await deleteToken(refreshToken);
                res.clearCookie("refreshToken");
            }
            return res.status(200).json({ message: "Logout successful." });
        } catch (error) {
            console.error("Error during logout:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    });

router.route("/refresh")
    .post(async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required." });
        }
        const ret = await verifyToken(refreshToken);
        if (!ret) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }
        const { userId, userName } = ret;
        try {
            const accessToken = req.cookies?.accessToken;
            if (accessToken) {
                await deleteToken(accessToken);
            }
            const newAccessToken = await generateToken(userId, userName, "ACCESS");
            res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1 * 60 * 60 * 1000 /** 1 hour */ });
            return res.status(200).json({ message: "Tokens refreshed successfully." });
        } catch (error) {
            console.error("Error during token refresh:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    });

router.route("/confirm")
    .post(async (req, res) => {
        const { token } = req.body;
        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Le jeton de confirmation est requis." });
        }
        const ret = await verifyToken(token);
        if (!ret) {
            return res.status(400).json({ message: "Token expiré ou invalide." });
        }
        const { userId } = ret;
        try {
            await db.update(usersTable).set({ confirmed: true }).where(eq(usersTable.id, userId));
            await deleteToken(token);
            return res.status(200).json({ message: "Email confirmé avec succès." });
        } catch (error) {
            console.error("Error during email confirmation:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    });

router.route("/resend-confirmation")
    .post(async (req, res) => {
        const { email } = req.body;
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Email is required." });
        }
        try {
            const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
            if (result.length === 0) {
                return res.status(404).json({ message: "User with this email does not exist." });
            }
            const user = result[0];
            if (user.confirmed) {
                return res.status(400).json({ message: "Email is already confirmed." });
            }
            await sendConfirmationEmail(email, user.id, user.username);
            return res.status(200).json({ message: "Confirmation email resent successfully." });
        } catch (error) {
            console.error("Error during resending confirmation email:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    });