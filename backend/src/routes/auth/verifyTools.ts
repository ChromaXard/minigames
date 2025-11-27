import db from "../../db/global";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function verifyEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (result.length > 0) {
        throw new Error("L'email existe déjà.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("L'email est invalide.");
    }
}

export function verifyPassword(password: string) {
    // Password must be at least 8 characters long and contain at least one number and one special character
    const hasMinLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&\-_*]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    
    if (!hasMinLength) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
    }
    else if (!hasUpperCase) {
        throw new Error("Le mot de passe doit contenir au moins une lettre majuscule.");
    }
    else if (!hasLowerCase) {
        throw new Error("Le mot de passe doit contenir au moins une lettre minuscule.");
    }
    else if (!hasNumber) {
        throw new Error("Le mot de passe doit contenir au moins un chiffre.");
    }
    else if (!hasSpecialChar) {
        throw new Error("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&-_*).");
    }
}

export async function verifyUsername(username: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (result.length > 0) {
        throw new Error("Le nom d'utilisateur existe déjà.");
    }
    // Username must be alphanumeric and between 3 to 30 characters
    if (username.length < 3 || username.length > 30) {
        throw new Error("Le nom d'utilisateur doit contenir entre 3 et 30 caractères.");
    }
    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    if (!usernameRegex.test(username)) {
        throw new Error("Le nom d'utilisateur est invalide.");
    }
}