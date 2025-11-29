import { generateToken } from "./tokenTools";
import { sendMail } from "@/mail/tools";
import db from "@/db/global";
import { tokensTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
    
export async function sendConfirmationEmail(email: string, userId: string, userName: string) : Promise<void> {
    await db.delete(tokensTable).where(and(eq(tokensTable.userId, userId), eq(tokensTable.type, "CONFIRMATION")));
    const token = await generateToken(userId, userName, "CONFIRMATION");
    const confirmationLink = `https://dev.akastler.fr/confirmation?token=${token}`;
    await sendMail(email, "Confirmer votre compte", undefined, `<a href="${confirmationLink}">Cliquez ici pour confirmer votre compte</a>`);
    await db.update(usersTable).set({lastConfirmationMailAt: Math.floor(Date.now() / 1000)}).where(eq(usersTable.id, userId));
}