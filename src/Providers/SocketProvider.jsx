import { createContext, useContext, useMemo, useState } from "react";
import io from "socket.io-client"

const socketContext = createContext()

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(import.meta.env.VITE_SERVER), [])
    const [opponent, setOpponent] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    return <socketContext.Provider value={{ socket, opponent, setOpponent, currentUser, setCurrentUser }}>
        {children}
    </socketContext.Provider>
}

export const useSocket = () => {
    return useContext(socketContext)
}