import "./index.css"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { SocketProvider } from "./Providers/SocketProvider"
import { PersistGate } from "redux-persist/integration/react"
import { persistor, store } from "./Redux/store"
import { Provider } from "react-redux"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ToastContainer } from "react-toastify"

createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <PersistGate loading={null} persistor={persistor}>
            <Provider store={store}>
                <SocketProvider>
                    <App />
                    <ToastContainer autoClose={1200} />
                </SocketProvider>
            </Provider>
        </PersistGate>
    </GoogleOAuthProvider>
)