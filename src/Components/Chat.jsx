import { useEffect, useRef, useState } from "react"
import { FaPaperPlane } from "react-icons/fa"
import { MdOutlineMessage } from "react-icons/md"
import { useSocket } from "../Providers/SocketProvider"
import { useSelector } from "react-redux"
import { useParams } from "react-router"

export const Chat = ({ isOpen }) => {

    const currentUser = useSelector(state => state.user)
    const { room_id } = useParams()
    const { opponent, socket } = useSocket()
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const scrollRef = useRef(null)

    useEffect(() => {
        socket.on("receivedMessage", content => {
            setMessages(messages => ([...messages, content]))
        })
    }, [])

    const sendMessage = () => {
        if (!message) return
        if (!opponent || !currentUser) return
        const content = {
            text: message,
            date_time: new Date().getTime(),
            to: opponent,
            from: currentUser,
            room_id
        }
        socket.emit("sendMessage", content)
        setMessages(messages => ([...messages, content]))
        setMessage("")
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({top: scrollRef.current.scrollHeight, behavior: "smooth"})
        }
    }, [messages])

    return <div className={`px-2 h-80 fixed duration-500 z-[1] overflow-hidden ${isOpen ? "top-2" : "-top-[100%]"} w-full max-w-[400px] rounded-xl`}>
        <div className="bg-white rounded flex flex-col h-full gap-1 justify-between">
            <div className="pt-1 px-2" >
                <div className="break-all h-[270px] flex overflow-y-scroll flex-col gap-2 scroll-none" ref={scrollRef}>
                    {
                        messages.map((msg, idx) => <div key={idx} className={`flex ${msg.from?.email == currentUser?.email ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] min-w-auto flex flex-col rounded ${msg.from?.email == currentUser?.email ? "items-end bg-gray-300 p-1" : "items-start p-1 bg-gray-500"}`}>
                                    {msg.from?.email != currentUser?.email && <div className="text-[12px] bg-gray-800 text-white text-center w-full px-2 p-1 rounded">{msg.from?.name}</div>}
                                    <div className="text-[15px]">{msg.text}</div>
                                <div className={`text-[12px] flex justify-end w-full`}>{new Date(msg.date_time).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"}).toUpperCase()}</div>
                                </div>
                            </div>
                        )      
                    }
                </div>
            </div>
            <form onSubmit={e => {e.preventDefault(); sendMessage()}} className="w-full h-[80px] px-0.5 flex gap-1 items-center">
                <div className="w-full border-2 border-gray-400 bg-white flex items-center rounded">
                    <div className="px-2">
                        <MdOutlineMessage />
                    </div>
                    <input type="text" value={message} placeholder="Message..." onChange={({target: {value}}) => setMessage(value)} className="w-full outline-none p-1"/>
                </div>
                <button type="submit" className="p-2 cursor-pointer border-gray-400 border-2 px-3 rounded shrink-0 text-black bg-white">
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    </div>
}
