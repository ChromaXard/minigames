"use client";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
	const { socket } = useSocket();
    const inputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<{content: string}[]>([]);
	useEffect(() => {
		if (!socket) return;
		socket.on("message", (msg: {content: string}) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
		});
		return () => {
			if (socket) {
				socket.off("message");
			}
		};
	}, [socket]);
    function sendMessage() {
        if (socket) {
            const payload = {
                content: inputRef.current?.value || "",
                channel: "global"
            };
            socket.emit("message", payload);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }
	return (<div>
        <div>
        tout les messages :
        <div style={{border: "1px solid black", height: "200px", overflowY: "scroll"}}>
            {messages.map((msg, index) => (
                <p key={index}>{msg.content}</p>
            ))}
        </div>
        </div>
        <input type="text" ref={inputRef}/>
        <button onClick={sendMessage}>
        Envoyer un message
        </button>
    </div>);
}
