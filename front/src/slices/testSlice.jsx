import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stays: [],
    selectedStay: null,
    stayRequests: {},
    stayParticipants: {}
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
        addStayRequest: (state, action) => {
            state.stayRequests = {
                ...state.stayRequests,
                [action.payload.stay_id]: [
                    ...(state.stayRequests[action.payload.stay_id] || []),
                    action.payload
                ]
            };
        },
        updateStayRequest: (state, action) => {
            const { stay_id, request_id, ...updatedData } = action.payload;
            if (state.stayRequests[stay_id]) {
                const index = state.stayRequests[stay_id].findIndex(req => req.request_id === request_id);
                if (index !== -1) {
                    state.stayRequests[stay_id][index] = {
                        ...state.stayRequests[stay_id][index],
                        ...updatedData
                    };
                }
            }
        },
        deleteStayRequest: (state, action) => {
            const { stay_id, request_id } = action.payload;
            if (state.stayRequests[stay_id]) {
                state.stayRequests[stay_id] = state.stayRequests[stay_id].filter(req => req.request_id !== request_id);
            }
        },
        setStayRequests: (state, action) => {
            const { stay_id, participants } = action.payload;
            state.stayRequests[stay_id] = participants || [];
        },
        updateStayParticipants: (state, action) => {
            const { stay_id, participants } = action.payload;
            const stayIndex = state.stays.findIndex(stay => stay.id === stay_id);
            if (stayIndex !== -1) {
                const stay = state.stays[stayIndex];
                
                // Calcul du nombre total de participants
                const peopleNumber = participants.reduce((sum, participant) => sum + participant.people_number, 0);

                // Calcul du nombre de lignes (participants)
                const totalLines = participants.length;

                // Ajout du nombre de lignes au total des participants
                const totalParticipants = peopleNumber + totalLines;
                
                // Calcul du nombre de participants en attente (ceux dont le statut est "en_attente")
                const pendingParticipants = participants.filter(participant => participant.status === 'en_attente').length;
                
                // Calcul du nombre total de participants confirmés
                const confirmedParticipants = totalParticipants - pendingParticipants;

                // Mise à jour des participants et des comptes en attente dans `stayParticipants`
                state.stayParticipants[stay_id] = {
                    totalParticipants,
                    pendingParticipants,
                    confirmedParticipants
                };
                console.log(confirmedParticipants)
                // Mise à jour du statut du séjour en fonction du nombre de participants confirmés
                let updatedStatus = "en_attente_de_validation";
                if (confirmedParticipants < stay.min_participant) {
                    updatedStatus = "participants_insuffisants";
                } else if (confirmedParticipants >= stay.max_participant) {
                    updatedStatus = "complet";
                }

                // Mise à jour du statut du séjour dans `stays`
                state.stays[stayIndex].status = updatedStatus;

                // Mise à jour du statut de `selectedStay` si nécessaire
                if (state.selectedStay?.id === stay_id) {
                    state.selectedStay.status = updatedStatus;
                }
            }
        },    
    }
});

export const { setStays, setSelectedStay, addStay, updateStay, deleteStay, addStayRequest, updateStayRequest, deleteStayRequest, setStayRequests, updateStayParticipants} = staySlice.actions;
export default staySlice.reducer;
