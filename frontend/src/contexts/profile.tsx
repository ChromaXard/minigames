"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
interface ProfileContextProps {
    username: string | null;
    email: string | null;
    userId: string | null;
    confirmed: boolean | null;
}

const ProfileContext = createContext<ProfileContextProps | null>(null);

const ProfileContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState<boolean | null>(null);
    const { isConnected } = useAuth();
    const contextValue = useMemo(() => {
        return {
            username,
            email,
            userId,
            confirmed,
        };
    }, [username, email, userId, confirmed]);
    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch("https://api.dev.akastler.fr/users/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.user.username);
                    setEmail(data.user.email);
                    setUserId(data.user.id);
                    setConfirmed(data.user.confirmed);
                } else {
                    setUsername(null);
                    setEmail(null);
                    setUserId(null);
                    setConfirmed(null);
                }
            } catch (error) {
                setUsername(null);
                setEmail(null);
                setUserId(null);
                setConfirmed(null);
            }
        }
        if (isConnected) {
            fetchProfile();
        } else {
            setUsername(null);
            setEmail(null);
            setUserId(null);
        }
    }, [isConnected]);
    return (
        <ProfileContext.Provider value={contextValue}>
            {children}
        </ProfileContext.Provider>
    );
}

export { ProfileContext, ProfileContextProvider };