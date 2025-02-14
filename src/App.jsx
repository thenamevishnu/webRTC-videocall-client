import { BrowserRouter, Routes, Route } from "react-router"
import { HomePage } from "./Pages/HomePage"
import { VideoCall } from "./Pages/VideoCall"

export const App = () => {
    return <BrowserRouter>
        <Routes>
            <Route path="/">
                <Route exact path="" Component={HomePage} />
                <Route path=":room_id" Component={VideoCall} />
            </Route>
        </Routes>
    </BrowserRouter>
}