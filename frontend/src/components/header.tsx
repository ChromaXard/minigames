"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
	UserIcon,
	ArrowRightStartOnRectangleIcon,
	HomeIcon,
	ArrowRightEndOnRectangleIcon,
	PencilSquareIcon,
	ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";

export default function Header() {
	const { isConnected, userInformations, useResendConfirmationEmail } = useAuth();
	return (
		<header className="flex flex-col">
			<div className="flex flex-row justify-between p-4 bg-black text-white">
				<div>
					<Link href="/" className="font-bold">
						Minigames App
					</Link>
				</div>
				<div>
					<nav className="space-x-2">
						<Link href="/">
							<HomeIcon className="inline-block w-6 h-6" />
						</Link>
						{isConnected ? (
							<>
								<Link href="/profil">
									<UserIcon className="inline-block w-6 h-6" />
								</Link>
								<Link href="/chat">
									<ChatBubbleLeftRightIcon className="inline-block w-6 h-6" />
								</Link>
								<Link href="/deconnexion">
									<ArrowRightStartOnRectangleIcon className="inline-block w-6 h-6" />
								</Link>
							</>
						) : (
							<>
								<Link href="/connexion">
									<ArrowRightEndOnRectangleIcon className="inline-block w-6 h-6" />
								</Link>
								<Link href="/inscription">
									<PencilSquareIcon className="inline-block w-6 h-6" />
								</Link>
							</>
						)}
					</nav>
				</div>
			</div>
            {userInformations && userInformations.confirmed === false && (
                <div className="bg-yellow-300 text-black text-center p-2 space-x-4 flex flex-row justify-center items-center">
                    <p>
                    Veuillez confirmer votre compte ! Un email de confirmation a été envoyé à votre adresse email (vérifiez vos spams).
                    </p>
                    <button className="underline cursor-pointer" onClick={() => useResendConfirmationEmail()} >Renvoyer l'email de confirmation</button>
                </div>
            )}
		</header>
	);
}
