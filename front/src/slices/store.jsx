import {configureStore} from "@reduxjs/toolkit";
import userReducer from './userSlice';
import stayReducer from './staySlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        stay: stayReducer,
    }
})

export default store