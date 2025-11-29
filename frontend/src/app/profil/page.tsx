"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
    const {userInformations} = useAuth();
    return <div>vous etes connecté en tant que : {userInformations?.username} {userInformations?.email} id : {userInformations?.userId}</div>;
}