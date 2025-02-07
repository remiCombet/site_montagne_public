import {configureStore} from "@reduxjs/toolkit";
import userReducer from './userSlice';
import stayReducer from './staySlice';
import testReducer from './testSlice';

// a supprimer et appeler via api
import highlightReducer from './highlightSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        stay: stayReducer,
        test: testReducer,
        highlights: highlightReducer,
    }
})

export default store