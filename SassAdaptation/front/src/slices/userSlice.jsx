import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    infos: {},
    isLogged: false,
    role: ''
};

export const userSlice = createSlice ({
    name: "user",
    initialState,
    reducers: {
        connectUser: (state, action) => {
            const { infos = {}, role = '' } = action.payload || {};
            state.infos = infos;
            state.role = role;
            state.isLogged = true;
        },
        logoutUser: (state) => {
            state.infos = {};
            state.role = '';
            state.isLogged = false;
        }
    }
});

export const { connectUser, logoutUser } = userSlice.actions;
export const selectUser = (state) => state.user;
export default userSlice.reducer;
