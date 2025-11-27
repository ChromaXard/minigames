"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePopups } from "@/hooks/usePopups";

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const { useAddPopup } = usePopups();
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const { isConnected } = useAuth();

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
            } else {
                try {
                    const jsonRet = await res.json();
                    const message = jsonRet?.message;
                    if (message) {
                        useAddPopup("confirmationError", message, "red");
                    } else {
                        useAddPopup("confirmationError", ["Jeton de confirmation invalide ou expiré.", "Veuillez demander un nouveau jeton."], "red");
                    }
                } catch {
                    useAddPopup("confirmationError", ["Jeton de confirmation invalide ou expiré.", "Veuillez demander un nouveau jeton."], "red");
                }
            }
        })
        .catch(() => {
            useAddPopup("confirmationError", "Une erreur est survenue lors de la confirmation.", "red");
        });
    }, [searchParams, router]);

    return (
        <div>
            <h1>Email Confirmation</h1>
            <input type="email" ref={emailRef} />
            <button onClick={() => {
                const email = emailRef.current?.value;
                if (email) {
                    fetch(`https://api.dev.akastler.fr/auth/resend-confirmation`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email })
                    })
                    .then((res) => {
                        if (res.ok) {
                            useAddPopup("resendSuccess", "Email de confirmation renvoyé avec succès !", "green");
                        } else {
                            useAddPopup("resendError", "Échec de l'envoi de l'email de confirmation.", "red");
                        }
                    })
                    .catch(() => {
                        useAddPopup("resendError", "Une erreur est survenue lors de la réexpédition de l'email de confirmation.", "red");
                    });
                }
            }}>Renvoyer l'email de confirmation</button>
        </div>
    );
}