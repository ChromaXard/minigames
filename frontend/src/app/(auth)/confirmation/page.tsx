"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePopups } from "@/hooks/usePopups";

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const [statusMessage, setStatusMessage] = useState<string>("Vérification en cours...");
    const { useAddPopup } = usePopups();
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const { userInformations, useResendConfirmationEmail } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            useAddPopup("noToken", "No confirmation token provided.", "red");
            router.replace("/");
            return;
        }

        fetch(`https://api.dev.akastler.fr/auth/confirm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        })
        .then(async (res) => {
            if (res.ok) {
                useAddPopup("confirmationSuccess", "Votre email a été confirmé avec succès !", "green");
                setStatusMessage("Votre email a été confirmé avec succès !");
            } else {
                try {
                    const jsonRet = await res.json();
                    const message = jsonRet?.message;
                    if (message) {
                        useAddPopup("confirmationError", message, "red");
                        setStatusMessage(message);
                    } else {
                        useAddPopup("confirmationError", ["Jeton de confirmation invalide ou expiré.", "Veuillez demander un nouveau jeton."], "red");
                        setStatusMessage("Jeton de confirmation invalide ou expiré. Veuillez demander un nouveau jeton.");
                    }
                } catch {
                    useAddPopup("confirmationError", ["Jeton de confirmation invalide ou expiré.", "Veuillez demander un nouveau jeton."], "red");
                    setStatusMessage("Jeton de confirmation invalide ou expiré. Veuillez demander un nouveau jeton.");
                }
            }
        })
        .catch(() => {
            useAddPopup("confirmationError", "Une erreur est survenue lors de la confirmation.", "red");
            setStatusMessage("Une erreur est survenue lors de la confirmation.");
        });
    }, [searchParams, router]);

    return (
        <div>
            <h1>{statusMessage}</h1>
            {
                !userInformations && (
                    <input type="email" ref={emailRef} />
                )
            }
            <button onClick={() => {
                if (userInformations) {
                    useResendConfirmationEmail(userInformations.email);
                    return;
                }
                const email = emailRef.current?.value;
                if (email) {
                    useResendConfirmationEmail(email);
                }
            }}>Renvoyer l'email de confirmation</button>
        </div>
    );
}