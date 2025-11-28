"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {UserIcon, ArrowRightStartOnRectangleIcon, HomeIcon, ArrowRightEndOnRectangleIcon, PencilSquareIcon, ChatBubbleLeftRightIcon} from "@heroicons/react/24/solid";

export default function Header() {
    const { isConnected } = useAuth();
    return (<header className="flex flex-row justify-between p-4 bg-black text-white">
        <div>
            <Link href="/" className="font-bold">
                Minigames App
            </Link>
        </div>
        <div>
            <nav className="space-x-2">
                <Link href="/"><HomeIcon className="inline-block w-6 h-6" /></Link>
                {isConnected ? (
                    <>
                        <Link href="/profil"><UserIcon className="inline-block w-6 h-6" /></Link>
                        <Link href="/chat"><ChatBubbleLeftRightIcon className="inline-block w-6 h-6" /></Link>
                        <Link href="/deconnexion"><ArrowRightStartOnRectangleIcon className="inline-block w-6 h-6" /></Link>
                    </>
                ) : (
                    <>
                        <Link href="/connexion"><ArrowRightEndOnRectangleIcon className="inline-block w-6 h-6" /></Link>
                        <Link href="/inscription"><PencilSquareIcon className="inline-block w-6 h-6" /></Link>
                    </>
                )}
            </nav>
        </div>
    </header>);
}