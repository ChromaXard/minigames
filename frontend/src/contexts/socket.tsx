"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface SocketContextProps {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps | null>(null);

const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isConnected } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const contextValue = useMemo(() => {
        return {
            socket,
        };
    }, [socket]);
    useEffect(() => {
        if (isConnected && socket == null) {
            const newSocket = io("https://api.dev.akastler.fr", {
                withCredentials: true,
            });
            setSocket(newSocket);
            return () => {
                newSocket.close();
            };
        } else if (!isConnected && socket != null) {
            socket.close();
            setSocket(null);
        }
    }, [isConnected]);
    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContextProvider, SocketContext };