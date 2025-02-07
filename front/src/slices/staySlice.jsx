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
                state.stays[index] = { ...state.stays[index], ...action.payload };
                if (state.selectedStay?.id === action.payload.id) {
                    state.selectedStay = { ...state.selectedStay, ...action.payload };
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
        // setStayRequests: (state, action) => {
        //     state.stayRequests = action.payload; // Charge toutes les demandes de séjour
        // },
        // addStayRequest: (state, action) => {
        //     state.stayRequests.push(action.payload); // Ajoute une nouvelle demande de séjour
        // },
        // updateStayRequest: (state, action) => {
        //     const { stayId, userId, status, numberOfPeople } = action.payload;
        //     const requestIndex = state.stayRequests.findIndex(
        //         request => request.stayId === stayId && request.userId === userId
        //     );
        //     if (requestIndex !== -1) {
        //         state.stayRequests[requestIndex] = {
        //             ...state.stayRequests[requestIndex],
        //             status,
        //             numberOfPeople
        //         };
        //     }
        // },
        // // Calculer le nombre total de participants à partir des demandes de séjour
        // calculateTotalParticipants: (state, action) => {
        //     const { stayId } = action.payload;
        //     const participantsCount = state.stayRequests
        //         .filter(request => request.stayId === stayId)
        //         .reduce((total, request) => total + request.numberOfPeople + 1, 0); // +1 pour l'utilisateur

        //     // Calculer et mettre à jour le statut du séjour
        //     const stayIndex = state.stays.findIndex(stay => stay.id === stayId);
        //     if (stayIndex !== -1) {
        //         const stay = state.stays[stayIndex];
        //         if (participantsCount >= stay.minParticipants) {
        //             stay.status = 'validé'; // Le séjour est validé si le nombre de participants atteint le minimum
        //         } else {
        //             stay.status = 'en attente'; // Sinon, il reste en attente
        //         }
        //     }
        // },
        // // Mettre à jour le statut du séjour à partir de l'état actuel des demandes
        // updateStayStatusFromRequests: (state, action) => {
        //     const { stayId, capacity } = action.payload;
        //     const totalParticipants = state.stayRequests
        //         .filter(request => request.stayId === stayId)
        //         .reduce((sum, request) => sum + request.numberOfPeople + 1, 0); // +1 pour l'utilisateur

        //     const stayIndex = state.stays.findIndex(stay => stay.id === stayId);
        //     if (stayIndex !== -1) {
        //         const stay = state.stays[stayIndex];
        //         if (totalParticipants >= capacity) {
        //             stay.status = 'validé';
        //         } else {
        //             stay.status = 'en attente';
        //         }
        //     }
        // }
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
    calculateTotalParticipants,
    updateStayStatusFromRequests
} = staySlice.actions;

export const selectStay = (state) => state.stay;

export default staySlice.reducer;
