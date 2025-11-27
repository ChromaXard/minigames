import { generateToken } from "./tokenTools";

export async function sendConfirmationEmail(email: string, userId: string, userName: string) : Promise<void> {
    const token = await generateToken(userId, userName, "CONFIRMATION");
    const confirmationLink = `https://dev.akastler.fr/confirmation?token=${token}`;
    console.log(`Sending confirmation email to ${email} with link: ${confirmationLink}`);
}