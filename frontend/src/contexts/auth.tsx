"use client";
import { usePopups } from "@/hooks/usePopups";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useMemo, useState } from "react";

interface AuthContextProps {
	useLogin: (username: string, password: string) => Promise<boolean>;
	useRegister: (
		username: string,
		email: string,
		password: string
	) => Promise<boolean>;
	useLogout: () => Promise<boolean>;
	userInformations: {
		username: string;
		userId: string;
		email: string;
		confirmed: boolean;
	} | null;
	isConnected: boolean;
	useResendConfirmationEmail: (email?: string) => Promise<void>;
	useResetVerify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [connected, setIsConnected] = useState<boolean>(false);
	const [mounted, setMounted] = useState<boolean>(false);
	const [fetching, setFetching] = useState<boolean>(false);
	const [lastCheck, setLastCheck] = useState<number>(0);
	const [userInformations, setUserInformations] = useState<{
		username: string;
		userId: string;
		email: string;
		confirmed: boolean;
	} | null>(null);
	const [fetchVerifyTimeout, setFetchVerifyTimeout] =
		useState<NodeJS.Timeout | null>(null);
    const { useAddPopup } = usePopups();
	async function fetchVerify() {
		if (fetching == true) {
			return;
		}
		if (Date.now() - lastCheck < 5 * 60 * 1000) {
			// 5 minutes
			return;
		}
		setFetching(true);
		const res = await fetch("https://api.dev.akastler.fr/auth/verify", {
			method: "GET",
			credentials: "include",
		});
		const ok = res.ok;
		if (ok == false) {
			const refreshRes = await fetch(
				"https://api.dev.akastler.fr/auth/refresh",
				{
					method: "POST",
					credentials: "include",
				}
			);
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
		if (fetchVerifyTimeout) {
			clearTimeout(fetchVerifyTimeout);
		}
		setFetchVerifyTimeout(setTimeout(fetchVerify, 5 * 60 * 1000)); // recheck every 5 minutes
	}
	async function resetVerify() {
		setLastCheck(0);
		if (fetchVerifyTimeout) {
			clearTimeout(fetchVerifyTimeout);
		}
		setFetchVerifyTimeout(null);
		fetchVerify();
	}
	async function resendConfirmationEmail(email?: string): Promise<void> {
		if (!email && userInformations) {
            email = userInformations.email;
        } else if (!email) {
            return;
        }
        const res = await fetch(`https://api.dev.akastler.fr/auth/resend-confirmation`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		});
        if (!res.ok) {
            useAddPopup("resend-confirmation-error", "Une erreur est survenue lors de la demande de renvoi de l'email de confirmation.", "red");
        } else {
            useAddPopup("resend-confirmation-success", "L'email de confirmation a été renvoyé avec succès !", "green");
        }
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
		if (ok) {
			resetVerify();
		}
		return ok;
	}
	async function register(
		username: string,
		email: string,
		password: string
	): Promise<boolean> {
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
		if (ok) {
			resetVerify();
		}
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
		if (ok) {
			setIsConnected(false);
			setUserInformations(null);
			resetVerify();
		}
		return ok;
	}
	const router = useRouter();
	const pathname = usePathname();
	const contextValue = useMemo(() => {
		return {
			isConnected: connected,
			userInformations: userInformations,
			useLogin: login,
			useRegister: register,
			useLogout: logout,
			useResetVerify: resetVerify,
            useResendConfirmationEmail: resendConfirmationEmail,
		};
	}, [connected, userInformations]);
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
			if (
				pathname == "/deconnexion" ||
				pathname == "/profil" ||
				pathname == "/chat" ||
				pathname.startsWith("/profil")
			) {
				// useAddPopup("logged-out", "Vous avez été déconnecté avec succès.", "green");
				router.replace("/connexion");
			}
		}
	}, [connected, mounted, fetching]);
	useEffect(() => {
		if (!connected) {
			setUserInformations(null);
			return;
		}
		const fetchUserInfo = async () => {
			const res = await fetch("https://api.dev.akastler.fr/users/me", {
				method: "GET",
				credentials: "include",
			});
			if (res.ok) {
				const json = await res.json();
				setUserInformations({
					username: json.user.username,
					userId: json.user.id,
					email: json.user.email,
					confirmed: json.user.confirmed,
				});
			} else {
				setUserInformations(null);
			}
		};
		fetchUserInfo();
	}, [connected]);

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

export { AuthContextProvider, AuthContext };
