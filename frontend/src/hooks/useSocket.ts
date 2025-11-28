"use client";
import { useContext } from "react";
import { SocketContext } from "@/contexts/socket";

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketContextProvider");
    }
    return context;
}