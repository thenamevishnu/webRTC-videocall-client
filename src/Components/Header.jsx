import { GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useDispatch, useSelector } from "react-redux"
import { createUser } from "../Redux/user.slice" 

export const Header = () => {

    const { email, name, picture } = useSelector(state => state.user)

    const dispatch = useDispatch()

    const handleError = () => {
        console.log("Error happend while login")
    }

    const handleSuccess = ({ credential }) => {
        const user = jwtDecode(credential)
        const { name, email, picture } = user
        dispatch(createUser({ name, email, picture }))
    }

    return <div className="sticky top-0 h-14 w-screen px-4 items-center shadow shadow-gray-400 flex justify-between">
        <div>MEET</div>
        <div>
            {
                !email ? <GoogleLogin shape="rectangular" type="standard" onError={handleError} onSuccess={handleSuccess} /> : <div>
                    <img src={picture} alt={name} className="w-10 h-10 rounded-full"/>
                </div>
            }
        </div>
    </div>
}