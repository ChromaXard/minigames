"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useMemo, useState } from "react";

interface PopupContextProps {
    useAddPopup: (name: string, content: string | string[], color: "red" | "green" | "blue" | "gray") => void;
}

const PopupContext = createContext<PopupContextProps | null>(null);

const PopupContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [mounted, setMounted] = useState<boolean>(false);
    const [popups, setPopups] = useState<Array<{name: string, content: string | string[], color: "red" | "green" | "blue" | "gray"}>>([]);
    const contextValue = useMemo(() => {
        return {
            useAddPopup: addPopup,
        };
    }, []);
    function addPopup(name: string, content: string | string[], color: "red" | "green" | "blue" | "gray") {
        setPopups(prev => [...prev, { name, content, color }]);
        setTimeout(() => {
            setPopups(prev => prev.filter(popup => popup.name !== name));
        }, 5 * 1000 ); // 5 seconds
    }
    useEffect(() => {
        setMounted(true);
    }, []);
    const greenPopup = "bg-green-500/75 border-green-700";
    const redPopup = "bg-red-500/75 border-red-700";
    const bluePopup = "bg-blue-500/75 border-blue-700";
    const grayPopup = "bg-gray-500/75 border-gray-700";
    return (
        <PopupContext.Provider value={contextValue}>
            <div id="popupArea" className="fixed top-5 left-5 z-50 flex flex-col  md:max-w-1/3 lg:max-w-1/4 overflow-auto max-h-1/2">
            {popups.map((popup, index) => (
                <div key={index} className={`${popup.color === "green" ? greenPopup : popup.color === "red" ? redPopup : popup.color === "blue" ? bluePopup : grayPopup} text-white rounded-md p-2 mb-2 border border-1 w-fit flex items-center justify-between space-x-2`}>
                <div>
                    {Array.isArray(popup.content) ? popup.content.map((line, i) => (
                        <p key={i}>{line}</p>
                    )) : <p>{popup.content}</p>}
                </div>
                <button onClick={() => {
                    setPopups(prev => prev.filter((_, i) => i !== index));
                }}>X</button>
                </div>
            ))}
            </div>
            {children}
        </PopupContext.Provider>);
};

export { PopupContextProvider, PopupContext };