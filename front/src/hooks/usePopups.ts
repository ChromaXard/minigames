"use client";
import { useContext } from "react";
import { PopupContext } from "@/contexts/popups";

export function usePopups() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopups doit être utilisé dans un PopupContextProvider");
    }
    return context;
}