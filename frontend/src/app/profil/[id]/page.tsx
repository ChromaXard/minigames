"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePopups } from "@/hooks/usePopups";
import { useRouter } from "next/navigation";

export default function ProfileId() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { isConnected } = useAuth();
    const { useAddPopup } = usePopups();
    const [fetchedUser, setFetchedUser] = useState<null | { username: string }>(null);
    useEffect(() => {
        if (isConnected === false) return;
        fetch(`https://api.dev.akastler.fr/users/${params.id}`, {
            method: "GET",
            credentials: "include",
        })
            .then(async response => {
                const json = await response.json();
                if (response.ok) {
                    return json;
                } else {
                    throw new Error(json.message || "Une erreur est survenue lors de la récupération du profil.");
                }
            })
            .then(data => {
                setFetchedUser(data.user);
            })
            .catch(error => {
                // console.error("Error fetching profile data:", error);
                useAddPopup("error-fetch-profile", error.message || "Une erreur est survenue lors de la récupération du profil.", "red");
                router.push("/profil");
            });
    }, [params.id, isConnected]);
    return <div>Profile Id Page for user {fetchedUser ? fetchedUser?.username : params.id}</div>;
}