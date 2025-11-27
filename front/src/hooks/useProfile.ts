"use client";
import { useContext } from "react";
import { ProfileContext } from "@/contexts/profile";

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile doit être utilisé dans un ProfileContextProvider");
    }
    return context;
}