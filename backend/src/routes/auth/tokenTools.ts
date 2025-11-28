import jwt from 'jsonwebtoken';
import db from '@/db/global';
import { tokensTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || "";

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
const WEEK_IN_SECONDS = 7 * DAY_IN_SECONDS;

export async function generateToken(userId:string, userName: string, type: "ACCESS" | "REFRESH" | "CONFIRMATION" | "RESET") : Promise<string> {
    const expiration = type === "ACCESS" ? '1h' :
                       type === "REFRESH" ? '7d' :
                       type === "CONFIRMATION" ? '30m' :
                       '1h';
    const expirationSeconds = type === "ACCESS" ? HOUR_IN_SECONDS :
                           type === "REFRESH" ? WEEK_IN_SECONDS :
                           type === "CONFIRMATION" ? 30 * MINUTE_IN_SECONDS :
                           HOUR_IN_SECONDS;
    const token = jwt.sign(
        { userId, userName },
        JWT_SECRET,
        { expiresIn: expiration }
    );
    try {
        await db.insert(tokensTable).values({
            userId,
            token,
            type,
            expiresAt: Math.floor(Date.now() / 1000) + expirationSeconds,
        });
    } catch (error) {
        console.error("Error inserting token into database:", error);
    }
    return token;
}

export async function deleteToken(token: string) : Promise<void> {
    await db.delete(tokensTable).where(eq(tokensTable.token, token));
}

export async function verifyToken(token: string) : Promise<{ userId: string; userName: string; } | null> {
    try {
        const tokenRecord = await db.select().from(tokensTable).where(eq(tokensTable.token, token));
        if (tokenRecord.length === 0) {
            return null;
        }
        if (tokenRecord[0].expiresAt < Math.floor(Date.now() / 1000)) {
            await db.delete(tokensTable).where(eq(tokensTable.token, token));
            return null;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; userName: string };
        return decoded;
    } catch (error) {
        return null;
    }
}