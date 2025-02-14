import { useFormik } from "formik"
import { FaEnvelope, FaIdCard, FaVideo } from "react-icons/fa"
import { useNavigate } from "react-router"
import { useSocket } from "../Providers/SocketProvider"
import { Fragment } from "react"
import { Header } from "../Components/Header"
import { TbVideoPlus } from "react-icons/tb";
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

export const HomePage = () => {

    const currentUser = useSelector(state => state.user)
    const redirect = useNavigate()
    const { socket } = useSocket()

    const formik = useFormik({
        initialValues: {
            room_id: ""
        },
        onSubmit: (values) => {
            if (!currentUser?.email) {
                return toast.error("Please login to continue")
            }
            return redirect(`/${values.room_id}`)
        }
    })

    return <Fragment>
        <Header />
        <div className="w-full flex flex-col md:flex-row md:items-center mt-5 md:mt-10 h-full">
            <div className="flex flex-col items-center w-full">
                <h1 className="text-xl uppercase font-bold">Connect With Anyone</h1>
                <p className="text-md text-gray-500">Connect with anyone, anywhere, anytime.</p>
            </div>
            <form onSubmit={formik.handleSubmit} className="w-full flex flex-col items-center gap-2 p-3 rounded mt-2">
                <div className="w-full flex flex-col gap-2 max-w-[500px]">
                    <div>
                        <h3 className="text-xl font-semibold text-center uppercase">Join Room</h3>
                    </div>
                    <div className="flex gap-1 items-center">
                        <div className="flex items-center shadow shadow-gray-400 w-full bg-white rounded">
                            <div className="p-2 px-3 pe-0">
                                <FaIdCard />
                            </div>
                            <input className="p-2 outline-none w-full" type="text" placeholder="Enter your room code" name="room_id" value={formik.values.room_id} onChange={formik.handleChange}/>
                        </div>
                        <button type="submit" className="p-2 bg-green-800/80 rounded cursor-pointer text-white">
                            <TbVideoPlus size={25}/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </Fragment>
}