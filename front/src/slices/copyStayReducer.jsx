import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stays: [],
    selectedStay: null,
    stayRequests: [], // Pour stocker les demandes de réservation
};

export const staySlice = createSlice({
    name: "stay",
    initialState,
    reducers: {
        setStays: (state, action) => {
            state.stays = action.payload;
        },
        setSelectedStay: (state, action) => {
            state.selectedStay = action.payload;
        },
        addStay: (state, action) => {
            state.stays.push(action.payload);
        },
        updateStay: (state, action) => {
            const index = state.stays.findIndex(stay => stay.id === action.payload.id);
            if (index !== -1) {
                state.stays[index] = {...state.stays[index], ...action.payload};
                if (state.selectedStay?.id === action.payload.id) {
                    state.selectedStay = {...state.selectedStay, ...action.payload};
                }
            }
        },
        deleteStay: (state, action) => {
            state.stays = state.stays.filter(stay => stay.id !== action.payload);
            if (state.selectedStay?.id === action.payload) {
                state.selectedStay = null;
            }
        },
        // Nouvelles actions pour la gestion des réservations
        setStayRequests: (state, action) => {
            state.stayRequests = action.payload;
        },
        addStayRequest: (state, action) => {
            state.stayRequests.push(action.payload);
        },
        updateStayRequest: (state, action) => {
            const { stayId, userId, status, numberOfPeople } = action.payload;
            const requestIndex = state.stayRequests.findIndex(
                request => request.stayId === stayId && request.userId === userId
            );
            if (requestIndex !== -1) {
                state.stayRequests[requestIndex] = {
                    ...state.stayRequests[requestIndex],
                    status,
                    numberOfPeople
                };
            }
        },
        // Mettre à jour le statut du séjour si la capacité est atteinte
        updateStayStatus: (state, action) => {
            const { stayId, currentParticipants, capacity } = action.payload;
            const stayIndex = state.stays.findIndex(stay => stay.id === stayId);
            
            if (stayIndex !== -1) {
                if (currentParticipants >= capacity) {
                    state.stays[stayIndex].status = 'validé';
                } else {
                    state.stays[stayIndex].status = 'en attente';
                }
            }
        }
    }
});

export const { 
    setStays, 
    setSelectedStay, 
    addStay, 
    updateStay, 
    deleteStay,
    setStayRequests,
    addStayRequest,
    updateStayRequest,
    updateStayStatus
} = staySlice.actions;

export const selectStay = (state) => state.stay;

export default staySlice.reducer;
