import { generateToken } from "./tokenTools";
import { sendMail } from "@/mail/tools";

export async function sendConfirmationEmail(email: string, userId: string, userName: string) : Promise<void> {
    const token = await generateToken(userId, userName, "CONFIRMATION");
    const confirmationLink = `https://dev.akastler.fr/confirmation?token=${token}`;
    await sendMail(email, "Confirmer votre compte", undefined, `<a href="${confirmationLink}">Cliquez ici pour confirmer votre compte</a>`);
}