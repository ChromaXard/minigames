import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as cookie from "cookie";
import logRequest from "./middlewares/logRequest.js";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use(logRequest);
const origins = ["https://api.dev.akastler.fr", "https://dev.akastler.fr"];
app.use(
	cors({
		origin: origins,
		credentials: true,
	})
);

import authRouter from "@/routes/auth/route.js";
import profilesRouter from "@/routes/users/route.js";
app.use("/auth", authRouter);
app.use("/users", profilesRouter);

import { createServer } from "http";
const httpServer = createServer(app);

import { Server } from "socket.io";
import { verifyToken } from "@/routes/auth/tokenTools.js";
const io = new Server(httpServer, {
	cors: {
		origin: origins,
		credentials: true,
	},
});

// ✅ Typage des événements
interface ServerToClientEvents {
	message: (msg: string) => void;
}

interface ClientToServerEvents {
	sendMessage: (msg: string) => void;
}

import { eq } from "drizzle-orm";

io.use(async (socket, next) => {
	const cookiesHeader = socket.handshake.headers.cookie || "";
	const parsedCookies = cookie.parse(cookiesHeader);
	const token = parsedCookies.accessToken;
	if (token) {
		const decoded = await verifyToken(token);
		if (!decoded) {
			return next(new Error("Authentication error"));
		}
		(socket as any).user = decoded;
    const res = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId));
    if (res.length === 0) {
        return next(new Error("Authentication error"));
    }
    if (!res[0].confirmed) {
        return next(new Error("Authentication error"));
    }
		next();
	} else {
		next(new Error("Authentication error"));
	}
});

io.on("connection", (socket) => {
	const user = (socket as any).user;
  console.log(`User connected: ${user.userName} (${user.userId})`);
	socket.join(user.id);
	socket.join("global");
	socket.on("message", (payload) => {
		const channel = payload.channel || "global";
		const sendPayload = {
			content: `[${user.userName}] ${payload.content}`,
		};
		io.to(channel).emit("message", sendPayload);
	});
	socket.on("disconnect", () => {});
});

import { checkSmtpConnection } from "@/mail/tools.js";
import db from "./db/global.js";
import { usersTable } from "./db/schema.js";

httpServer
	.listen(PORT, async () => {
		console.log("Server running at PORT: ", PORT);
		try {
			const smtpOk = await checkSmtpConnection();
			if (smtpOk) {
				console.log("SMTP connection verified successfully.");
			} else {
				console.error("Failed to verify SMTP connection.");
			}
		} catch (error) {
			console.error("Error verifying SMTP connection:", error);
		}
	})
	.on("error", (error) => {
		// gracefully handle error
		throw new Error(error.message);
	});
