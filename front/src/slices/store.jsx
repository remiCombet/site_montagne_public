import {configureStore} from "@reduxjs/toolkit";
import userReducer from './userSlice';
import stayReducer from './staySlice';
import highlightReducer from './highlightSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        stay: stayReducer,
        highlights: highlightReducer,
    }
})

export default store