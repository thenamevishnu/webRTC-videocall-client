import { Navigate, useParams } from "react-router";
import { useSocket } from "../Providers/SocketProvider";
import { useEffect, useRef, useState } from "react";
import { IoCallOutline } from "react-icons/io5";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { useSelector } from "react-redux"
import { MdOutlineMessage } from "react-icons/md";
import { Chat } from "../Components/Chat";
import { toast } from "react-toastify";

const servers = {
    iceServers: [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
};

export const VideoCall = () => {

    const { email, name, picture } = useSelector(state => state.user)   
    const { room_id } = useParams();
    const { socket, opponent, setOpponent } = useSocket();
    const localStream = useRef(null);
    const localVideo = useRef(null);
    const remoteStream = useRef(null);
    const remoteVideo = useRef(null);
    const peerConnection = useRef(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isMessageOpen, setMessageOpen] = useState(false)

    if (!email || !room_id) {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        socket.emit("join_room", { email, name, picture, room_id })
    }, [])

    const createPeerConnection = async () => {
        peerConnection.current = new RTCPeerConnection(servers);

        remoteStream.current = new MediaStream();

        if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
        });
        }

        peerConnection.current.ontrack = (ev) => {
            ev.streams[0].getTracks().forEach((track) => {
                remoteStream.current.addTrack(track);
                remoteVideo.current.srcObject = remoteStream.current;
            })
        }

        peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("sendMessageToPeer", {
                type: "candidate",
                candidate: event.candidate,
                room_id,
            });
        }
        };
    };

    const createOffer = async () => {
        if (!peerConnection.current) {
            await createPeerConnection();
        }
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("sendMessageToPeer", {
            type: "offer",
            offer: offer,
            room_id,
        });
    };

    const handleUserConnected = (data) => {
        setOpponent(data);
        socket.emit("max-user-connected", { email, name, picture, room_id });
    };

    const createAnswer = async (offer) => {
        if (!peerConnection.current) {
            await createPeerConnection();
        }
        if (!offer || typeof offer !== "object" || !offer.type || !offer.sdp) {
            console.error("Invalid offer received:", offer);
            return;
        }
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("sendMessageToPeer", {
            type: "answer",
            answer: answer,
            room_id,
        });
    };

    const addAnswer = async (answer) => {
        if (!peerConnection.current || peerConnection.current.signalingState === 'closed') {
            await createPeerConnection();
        }
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleEndCall = async () => {
        try {
            if(peerConnection.current) {
                await peerConnection.current.close()
            }
            setOpponent(null);
            localStream.current.getTracks().forEach(track => track.stop())
            remoteStream.current.getTracks().forEach(track => track.stop())
            socket.emit("end_call", { email, name, picture, room_id });
            location.href = "/"
        } catch (err) {
            location.href = "/"
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on("user_connected", handleUserConnected);
            socket.on("receivedPeerToPeer", async (data) => {
                if (data.type === "offer") {
                    await createAnswer(data.offer);
                }
                if (data.type === "answer") {
                    await addAnswer(data.answer);
                }
                if (data.type === "candidate") {
                    if (peerConnection.current) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate))
                    }
                }
            })
            socket.on("call_ended", async data => {
                setOpponent(null);
                console.log("left");
                if(peerConnection.current) {
                    await peerConnection.current.close()
                }
                setOpponent(null);
                localStream.current.getTracks().forEach(track => track.stop())
                remoteStream.current.getTracks().forEach(track => track.stop())
                location.href = "/"
            })
            socket.on("max_user_reached", data => {
                setOpponent(data)
            })
        }
    }, [socket]);

    useEffect(() => {
        (async () => {
        try {
            const media = await navigator.mediaDevices.getUserMedia({
                video: isVideoEnabled,
                audio: isAudioEnabled,
            })
            localStream.current = media;
            if (localVideo.current) {
                localVideo.current.srcObject = media;
            }
            await createOffer();
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
        })();
    }, []);

    const toggleMic = async () => {
        const audioPermission = await navigator.permissions.query({ name: "microphone" })
        if (audioPermission.state == "denied") {
            return toast.error("Please allow access to microphone")
        }
        const audioTrack = localStream.current.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
    }

    const toggleVideo = async () => {
        const videoPermission = await navigator.permissions.query({ name: "camera" })
        if (videoPermission.state == "denied") {
            return toast.error("Please allow access to camera")
        }
        const videoTrack = localStream.current.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        if (localVideo.current) {
            if (videoTrack.enabled) {
                localVideo.current.srcObject = localStream.current;
            } else {
                localVideo.current.srcObject = null;
            }
        }
    }

    const handleMessage = () => {
        setMessageOpen(isOpen => !isOpen)
    }

    return (
        <div>
            <div className="p-2 relative flex justify-center h-screen w-full">
                <Chat isOpen={isMessageOpen} />
                <video ref={remoteVideo} autoPlay className="-scale-x-[1] rounded-xl w-full bg-black object-contain h-full" />
                {!opponent && <div className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Waiting for opponent...</div>}
                <video ref={localVideo} autoPlay className={`w-full -scale-x-[1] max-w-44 rounded-xl h-28 bg-[#222] object-cover absolute top-4 right-4`} />
                
                <div className="flex justify-center gap-3 items-center absolute bottom-3 ">
                    <div onClick={toggleMic} className="bg-violet-700 p-3 cursor-pointer text-white rounded-xl text-xl">
                        {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </div>
                    <div onClick={toggleVideo} className="bg-violet-700 p-3 cursor-pointer text-white rounded-xl text-xl">
                        {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                    </div>
                    <div onClick={handleMessage} className="bg-red-500/80 p-3 cursor-pointer text-white rounded-xl text-xl">
                        <MdOutlineMessage />
                    </div>
                    <div onClick={handleEndCall} className="bg-red-500/80 p-3 cursor-pointer text-white rounded-xl text-xl">
                        <IoCallOutline />
                    </div>
                </div>
            </div>
        </div>
    );
};



