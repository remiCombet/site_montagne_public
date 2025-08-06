import { createSlice, createSelector } from "@reduxjs/toolkit";


// État initial du slice "stay", gère les séjours, les demandes et les participants.
const initialState = {
    stays: [], // Liste des séjours
    selectedStay: null, // Séjour actuellement sélectionné
    stayRequests: {}, // Liste des demandes de séjour par séjour_id
    stayParticipants: {} // Liste des participants par séjour_id
};

export const staySlice = createSlice({
    name: "stay",
    initialState,
    reducers: {
        // Met à jour la liste des séjours
        setStays: (state, action) => {
            state.stays = action.payload;
        },

        // Met à jour le séjour actuellement sélectionné
        setSelectedStay: (state, action) => {
            state.selectedStay = action.payload;
        },
        
        // Ajoute un nouveau séjour à la liste des séjours
        addStay: (state, action) => {
            state.stays.push(action.payload);
        },

        // Met à jour un séjour existant en fonction de son id
        updateStayStore: (state, action) => {
            const index = state.stays.findIndex(stay => stay.id === action.payload.id);
            if (index !== -1) {
                // Mise à jour de toutes les propriétés fournies
                state.stays[index] = { ...state.stays[index], ...action.payload };
                
                // Mise à jour du séjour sélectionné si nécessaire
                if (state.selectedStay?.id === action.payload.id) {
                    state.selectedStay = { ...state.selectedStay, ...action.payload };
                }
            }
        },

        // Supprime un séjour de la liste des séjours et met à jour le séjour sélectionné si nécessaire
        deleteStayStore: (state, action) => {
            state.stays = state.stays.filter(stay => stay.id !== action.payload);
            if (state.selectedStay?.id === action.payload) {
                state.selectedStay = null;
            }
        },

        // Ajoute une demande de séjour
        addStayRequest: (state, action) => {
            state.stayRequests = {
                ...state.stayRequests,
                [action.payload.stay_id]: [
                    ...(state.stayRequests[action.payload.stay_id] || []),
                    action.payload
                ]
            };
        },

        // Met à jour une demande de séjour existante
        updateStayRequest: (state, action) => {
            const { stay_id, request_id, ...updatedData } = action.payload;
            const stayIdStr = stay_id.toString();
            
            if (state.stayRequests[stayIdStr]) {
                const index = state.stayRequests[stayIdStr].findIndex(req => req.id === request_id);
                
                if (index !== -1) {
                    state.stayRequests[stayIdStr][index] = {
                        ...state.stayRequests[stayIdStr][index],
                        ...updatedData
                    };
                } else {
                    console.warn("Request not found:", {
                        stayId: stayIdStr,
                        requestId: request_id
                    });
                }
            } else {
                console.warn("Stay not found:", {
                    stayId: stayIdStr
                });
            }
        },

        // Supprime une demande de séjour
        deleteStayRequest: (state, action) => {
            const { stay_id, request_id } = action.payload;
            const stayIdStr = stay_id.toString();
            
            if (state.stayRequests[stayIdStr]) {
                state.stayRequests[stayIdStr] = state.stayRequests[stayIdStr].filter(
                    req => req.id !== request_id
                );
            }
        },

        // Met à jour les demandes de séjour pour un séjour spécifique
        setStayRequests: (state, action) => {
            const { stay_id, participants } = action.payload;
            state.stayRequests[stay_id] = participants || [];
        },

        // Met à jour les participants pour un séjour spécifique et ajuste le statut du séjour en fonction du nombre de participants
        updateStayParticipants: (state, action) => {
            const { stay_id, participants } = action.payload;
            const stayIndex = state.stays.findIndex(stay => stay.id === stay_id);
            if (stayIndex !== -1) {
                const stay = state.stays[stayIndex];
                
                // Calcul du nombre total de participants pour TOUTES les demandes
                let totalParticipants = 0;
                let confirmedParticipants = 0;
                let pendingParticipants = 0;
                
                // Pour chaque demande, calculer le nombre total de personnes (demandeur + accompagnants)
                participants.forEach(participant => {
                    // Nombre de personnes pour cette demande
                    const peopleCount = 1 + parseInt(participant.people_number || 0);
                    
                    // Ajouter au compteur approprié selon le statut
                    if (participant.status === 'validé') {
                        confirmedParticipants += peopleCount;
                    } else if (participant.status === 'en_attente' || participant.status === 'en_attente_validation') {
                        pendingParticipants += peopleCount;
                    }
                    
                    // Ajouter au total uniquement si la demande est validée ou en attente
                    if (participant.status !== 'refusé') {
                        totalParticipants += peopleCount;
                    }
                });
        
                // Mise à jour des statistiques du séjour
                state.stayParticipants[stay_id] = {
                    totalParticipants,
                    pendingParticipants,
                    confirmedParticipants
                };
        
                // Déterminer l'état de remplissage
                let fillStatus = "en_attente_validation";
                if (confirmedParticipants < stay.min_participant) {
                    fillStatus = "participants_insuffisants";
                } else if (confirmedParticipants >= stay.max_participant) {
                    fillStatus = "complet";
                }
                
                // Mise à jour de l'état de remplissage
                state.stays[stayIndex].fill_status = fillStatus;
                
                // Mise à jour du séjour sélectionné si nécessaire
                if (state.selectedStay?.id === stay_id) {
                    state.selectedStay.fill_status = fillStatus;
                }
            }
        },
        resetStayState: (state) => {
            state.stays = initialState.stays;
            state.selectedStay = initialState.selectedStay;
            state.stayRequests = initialState.stayRequests;
            state.stayParticipants = initialState.stayParticipants;
        },
    }
});


// Exportation des actions
export const { setStays, setSelectedStay, addStay, updateStayStore, deleteStayStore, addStayRequest, updateStayRequest, deleteStayRequest, setStayRequests, updateStayParticipants, resetStayState} = staySlice.actions;


// Sélecteurs de base
export const selectStayState = (state) => state.stay;
export const selectStays = (state) => state.stay.stays;
export const selectSelectedStay = (state) => state.stay.selectedStay;
export const selectStayRequests = (state) => state.stay.stayRequests;
export const selectStayParticipants = (state) => state.stay.stayParticipants;


// Sélecteurs mémorisés
export const selectStayById = createSelector(
    [selectStays, (_, stayId) => stayId],
    (stays, stayId) => stays.find(stay => stay.id === stayId)
);

export const selectRequestsByStayId = createSelector(
    [selectStayRequests, (_, stayId) => stayId],
    (requests, stayId) => requests[stayId] || []
);

export const selectParticipantsByStayId = createSelector(
    [selectStayParticipants, (_, stayId) => stayId],
    (participants, stayId) => participants[stayId] || {
        totalParticipants: 0,
        pendingParticipants: 0,
        confirmedParticipants: 0
    }
);


// Sélecteur complexe combinant plusieurs données
export const selectStayWithDetails = createSelector(
    [selectStayById, selectRequestsByStayId, selectParticipantsByStayId],
    (stay, requests, participants) => {
        if (!stay) return null;
        return {
            ...stay,
            requests,
            participants
        };
    }
);

// Exportation du reducer
export default staySlice.reducer;
