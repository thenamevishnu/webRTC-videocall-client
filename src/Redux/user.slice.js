import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState: {
        email: "",
        picture: "",
        name: ""
    },
    reducers: {
        createUser: (state, action) => {
            const { payload } = action
            for (const key in payload) {
                state[key] = payload[key]
            }
        },
        clearUser: (state) => {
            for (const key in state) {
                state[key] = ""
            }
        }
    }
})

export const { createUser, clearUser } = userSlice.actions
export const { reducer: userReducer } = userSlice