"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useMemo, useState } from "react";

interface AuthContextProps {
    useLogin: (username: string, password: string) => Promise<boolean>;
    useRegister: (username: string, email: string, password: string) => Promise<boolean>;
    useLogout: () => Promise<boolean>;
    isConnected: boolean;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [connected, setIsConnected] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [lastCheck, setLastCheck] = useState<number>(0);
    async function fetchVerify() {
        if (fetching == true) {
            return;
        }
        if (Date.now() - lastCheck < 5 * 60 * 1000) { // 5 minutes
            return;
        }
        setFetching(true);
        const res = await fetch("https://api.dev.akastler.fr/auth/verify", {
            method: "GET",
            credentials: "include",
        });
        const ok = res.ok;
        if (ok == false) {
            const refreshRes = await fetch("https://api.dev.akastler.fr/auth/refresh", {
                method: "POST",
                credentials: "include",
            });
            if (refreshRes.ok) {
                setIsConnected(true);
                setFetching(false);
                setLastCheck(Date.now());
                setTimeout(fetchVerify, 5 * 60 * 1000); // recheck every 5 minutes
                return;
            }
        }
        setIsConnected(ok);
        setLastCheck(Date.now());
        setFetching(false);
        setTimeout(fetchVerify, 5 * 60 * 1000); // recheck every 5 minutes
    }
    async function login(username: string, password: string): Promise<boolean> {
        if (connected) {
            return true;
        }
        const res = await fetch("https://api.dev.akastler.fr/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ username, password }),
        });
        const ok = res.ok;
        setIsConnected(ok);
        return ok;
    }
    async function register(username: string, email: string, password: string): Promise<boolean> {
        if (connected) {
            return true;
        }
        const res = await fetch("https://api.dev.akastler.fr/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ username, email, password }),
        });
        const ok = res.ok;
        setIsConnected(ok);
        return ok;
    }
    async function logout(): Promise<boolean> {
        if (!connected) {
            return true;
        }
        const res = await fetch("https://api.dev.akastler.fr/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        const ok = res.ok;
        setIsConnected(!ok);
        return ok;
    }
    const router = useRouter();
    const pathname = usePathname();
    const contextValue = useMemo(() => {
        return {
            isConnected: connected,
            useLogin: login,
            useRegister: register,
            useLogout: logout,
        };
    }, [connected]);
    useEffect(() => {
        setMounted(true);
        fetchVerify();
    }, []);
    useEffect(() => {
        if (!mounted || fetching) return;
        if (connected) {
            // useAddPopup("auth-success", "Vous êtes connecté avec succès !", "green");
            if (pathname == "/connexion" || pathname == "/inscription") {
                // useAddPopup("redirect-home", "Vous ne pouvez pas accéder à cette page lorsque vous êtes connecté.", "red");
                router.replace("/");
            }
        } else {
            if (pathname == "/deconnexion" || pathname == "/profil" || pathname == "/chat" || pathname.startsWith("/profil")) {
                // useAddPopup("logged-out", "Vous avez été déconnecté avec succès.", "green");
                router.replace("/connexion");
            }
        }
    }, [connected, mounted, fetching]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContextProvider, AuthContext };