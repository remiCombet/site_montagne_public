// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     stays: [],
//     selectedStay: null,
//     stayRequests: [], // Pour stocker les demandes de réservation
// };

// export const staySlice = createSlice({
//     name: "stay",
//     initialState,
//     reducers: {
//         setStays: (state, action) => {
//             state.stays = action.payload;
//         },
//         setSelectedStay: (state, action) => {
//             state.selectedStay = action.payload;
//         },
//         addStay: (state, action) => {
//             state.stays.push(action.payload);
//         },
//         updateStay: (state, action) => {
//             const index = state.stays.findIndex(stay => stay.id === action.payload.id);
//             if (index !== -1) {
//                 state.stays[index] = { ...state.stays[index], ...action.payload };
//                 if (state.selectedStay?.id === action.payload.id) {
//                     state.selectedStay = { ...state.selectedStay, ...action.payload };
//                 }
//             }
//         },
//         deleteStay: (state, action) => {
//             state.stays = state.stays.filter(stay => stay.id !== action.payload);
//             if (state.selectedStay?.id === action.payload) {
//                 state.selectedStay = null;
//             }
//         },
//         // Nouvelles actions pour la gestion des réservations
//         // setStayRequests: (state, action) => {
//         //     state.stayRequests = action.payload; // Charge toutes les demandes de séjour
//         // },
//         // addStayRequest: (state, action) => {
//         //     state.stayRequests.push(action.payload); // Ajoute une nouvelle demande de séjour
//         // },
//         // updateStayRequest: (state, action) => {
//         //     const { stayId, userId, status, numberOfPeople } = action.payload;
//         //     const requestIndex = state.stayRequests.findIndex(
//         //         request => request.stayId === stayId && request.userId === userId
//         //     );
//         //     if (requestIndex !== -1) {
//         //         state.stayRequests[requestIndex] = {
//         //             ...state.stayRequests[requestIndex],
//         //             status,
//         //             numberOfPeople
//         //         };
//         //     }
//         // },
//         // // Calculer le nombre total de participants à partir des demandes de séjour
//         // calculateTotalParticipants: (state, action) => {
//         //     const { stayId } = action.payload;
//         //     const participantsCount = state.stayRequests
//         //         .filter(request => request.stayId === stayId)
//         //         .reduce((total, request) => total + request.numberOfPeople + 1, 0); // +1 pour l'utilisateur

//         //     // Calculer et mettre à jour le statut du séjour
//         //     const stayIndex = state.stays.findIndex(stay => stay.id === stayId);
//         //     if (stayIndex !== -1) {
//         //         const stay = state.stays[stayIndex];
//         //         if (participantsCount >= stay.minParticipants) {
//         //             stay.status = 'validé'; // Le séjour est validé si le nombre de participants atteint le minimum
//         //         } else {
//         //             stay.status = 'en attente'; // Sinon, il reste en attente
//         //         }
//         //     }
//         // },
//         // // Mettre à jour le statut du séjour à partir de l'état actuel des demandes
//         // updateStayStatusFromRequests: (state, action) => {
//         //     const { stayId, capacity } = action.payload;
//         //     const totalParticipants = state.stayRequests
//         //         .filter(request => request.stayId === stayId)
//         //         .reduce((sum, request) => sum + request.numberOfPeople + 1, 0); // +1 pour l'utilisateur

//         //     const stayIndex = state.stays.findIndex(stay => stay.id === stayId);
//         //     if (stayIndex !== -1) {
//         //         const stay = state.stays[stayIndex];
//         //         if (totalParticipants >= capacity) {
//         //             stay.status = 'validé';
//         //         } else {
//         //             stay.status = 'en attente';
//         //         }
//         //     }
//         // }
//     }
// });

// export const { 
//     setStays, 
//     setSelectedStay, 
//     addStay, 
//     updateStay, 
//     deleteStay,
//     setStayRequests,
//     addStayRequest,
//     updateStayRequest,
//     calculateTotalParticipants,
//     updateStayStatusFromRequests
// } = staySlice.actions;

// export const selectStay = (state) => state.stay;

// export default staySlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

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
                state.stays[index] = { ...state.stays[index], ...action.payload };
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

        // Supprime une demande de séjour
        deleteStayRequest: (state, action) => {
            const { stay_id, request_id } = action.payload;
            if (state.stayRequests[stay_id]) {
                state.stayRequests[stay_id] = state.stayRequests[stay_id].filter(req => req.request_id !== request_id);
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
                
                // Calcul du nombre total de participants
                const peopleNumber = participants.reduce((sum, participant) => sum + participant.people_number, 0);
                const totalLines = participants.length;
                const totalParticipants = peopleNumber + totalLines;

                // Calcul du nombre de participants en attente et confirmés
                const pendingParticipants = participants.filter(participant => participant.status === 'en_attente').length;
                const confirmedParticipants = totalParticipants - pendingParticipants;

                // Mise à jour du nombre total et des participants confirmés
                state.stayParticipants[stay_id] = {
                    totalParticipants,
                    pendingParticipants,
                    confirmedParticipants
                };

                // Détermine le statut du séjour
                let updatedStatus = "en_attente_de_validation";
                if (confirmedParticipants < stay.min_participant) {
                    updatedStatus = "participants_insuffisants";
                } else if (confirmedParticipants >= stay.max_participant) {
                    updatedStatus = "complet";
                }

                // Mise à jour du statut du séjour
                state.stays[stayIndex].status = updatedStatus;

                // Mise à jour du statut du séjour sélectionné si nécessaire
                if (state.selectedStay?.id === stay_id) {
                    state.selectedStay.status = updatedStatus;
                }
            }
        },    
    }
});

// Exportation des actions
export const { setStays, setSelectedStay, addStay, updateStayStore, deleteStayStore, addStayRequest, updateStayRequest, deleteStayRequest, setStayRequests, updateStayParticipants} = staySlice.actions;

// Exportation du reducer
export default staySlice.reducer;
