"use client";
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthContextProvider");
    }
    return context;
}
