"use client";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { usePopups } from "@/hooks/usePopups";
import Form from "@/components/formComp/form";
import { use, useRef } from "react";

const loginSchema = z.object({
	username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères").max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères"),
	password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(100, "Le mot de passe ne doit pas dépasser 100 caractères"),
});

export default function Login() {
	const { useLogin } = useAuth();
	const { useAddPopup } = usePopups();
	const formRef = useRef<HTMLFormElement>(null);
	function tryLogin(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const parsed = loginSchema.safeParse({
			username: formData.get("username"),
			password: formData.get("password"),
		});
		if (!parsed.success) {
			parsed.error.issues.forEach((issue) => {
				useAddPopup("login-error-" + issue.path.join("-"), issue.message, "red");
			});
			return;
		}
		const { username, password } = parsed.data;
		useLogin(username, password).then((success) => {
			if (success) {
				useAddPopup("auth-success", "Vous êtes connecté avec succès !", "green");
				formRef.current?.reset();
			}
		});
	}
	return (
		<div className="flex flex-col items-center justify-center mt-10 mx-2">
			<Form
				inputs={[
					{ id: "username", label: "Nom d'utilisateur", type: "text", placeholder: "JeanPierre" },
					{ id: "password", label: "Mot de passe", type: "password", placeholder: "********" },
				]}
				onSubmitFn={tryLogin}
				formTitle={"Connexion"}
				ref={formRef}
				submitButtonText="Se connecter"
			/>
		</div>
	);
}
