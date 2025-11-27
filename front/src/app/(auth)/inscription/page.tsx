"use client";
import Form from "@/components/formComp/form";
import { useAuth } from "@/hooks/useAuth";
import { useRef } from "react";
import { z } from "zod";
import { usePopups } from "@/hooks/usePopups";

const registerSchema = z.object({
    username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères").max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères").regex(/^[a-zA-Z0-9]+$/, "Le nom d'utilisateur doit être alphanumérique"),
    email: z.email("L'email n'est pas valide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(100, "Le mot de passe ne doit pas dépasser 100 caractères").regex(/^(?=.*[0-9])(?=.*[!@#$%^&*_\-])(?=.*[A-Z])(?=.*[a-z])[A-Za-z0-9!@#$%^&*_\-]{8,}$/, "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"),
    confirmPassword: z.string().min(8, "La confirmation du mot de passe doit contenir au moins 8 caractères").max(100, "La confirmation du mot de passe ne doit pas dépasser 100 caractères"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
});

export default function Register() {
    const formRef = useRef<HTMLFormElement>(null);
    const { useRegister } = useAuth();
    const { useAddPopup } = usePopups();
    async function tryRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const parsed = registerSchema.safeParse({
            username,
            email,
            password,
            confirmPassword,
        });
        if (!parsed.success) {  
            parsed.error.issues.forEach((issue) => {
				useAddPopup("login-error-" + issue.path.join("-"), issue.message, "red");
			});
            return;
        }
        useRegister(username, email, password).then((success) => {
            if (success) {
                formRef.current?.reset();
            }
        });
    }
    return (<>
        <div className="flex flex-col items-center justify-center mt-10 mx-2">
            <Form
                inputs={[
                    { id: "username", label: "Nom d'utilisateur", type: "text", placeholder: "JeanPierre" },
                    { id: "email", label: "Email", type: "email", placeholder: "jp@example.com" },
                    { id: "password", label: "Mot de passe", type: "password", placeholder: "********" },
                    { id: "confirmPassword", label: "Confirmer le mot de passe", type: "password", placeholder: "********" },
                ]}
                onSubmitFn={tryRegister}
                formTitle={"Inscription"}
                ref={formRef}
                submitButtonText="S'inscrire"
            />
        </div>
    </>)
}