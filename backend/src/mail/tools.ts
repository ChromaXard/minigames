import {transporter} from './global';

export async function checkSmtpConnection(): Promise<Boolean> {
    return await transporter.verify();
}

export async function sendMail(to: string, subject: string, text?: string, html?: string): Promise<void> {
    if (!text && !html) {
        throw new Error("Either text or html content must be provided.");
    }
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: subject,
        text: text,
        html: html,
    }
    await transporter.sendMail(mailOptions);
}