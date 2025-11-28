"use client";

import { useProfile } from "@/hooks/useProfile";
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";

export default function Profile() {
    const profile = useProfile();
    return <div>vous etes connecté en tant que : {profile?.username} {profile?.email} id : {profile?.userId}</div>;
}