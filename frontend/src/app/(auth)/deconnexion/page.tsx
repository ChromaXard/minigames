"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePopups } from "@/hooks/usePopups";
import { useEffect } from "react";

export default function Logout() {
    const { useLogout, isConnected } = useAuth();
    const { useAddPopup } = usePopups();
    
    useEffect(() => {
        const handleLogout = async () => {
            if (isConnected === false) {
                useAddPopup("logout-failed", "Vous n'êtes pas connecté.", "red");
                return;
            }
            const success = await useLogout();
            if (success) {
                useAddPopup("logged-out", "Vous avez été déconnecté avec succès.", "green");
            }
        };
        
        handleLogout();
    }, []);
    
    return (
        <>
            <h1>Logout Page</h1>
            <span>Déconnexion en cours...</span>
        </>
    );
}