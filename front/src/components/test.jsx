import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalParticipants, addStayParticipant } from "../api/test";
import { setStayRequests, updateStayParticipants, selectRequestsByStayId, selectStayById, selectParticipantsByStayId } from "../slices/staySlice";

const Test = ({ stayId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newParticipant, setNewParticipant] = useState({
        name: "",
        people_number: 0
    });

    const dispatch = useDispatch();
    
    // récupération des sélecteurs mémorisés
    const stayRequests = useSelector(state => selectRequestsByStayId(state, stayId));
    const selectedStay = useSelector(state => selectStayById(state, stayId));
    const stayParticipants = useSelector(state => selectParticipantsByStayId(state, stayId));

    // Fonction pour récupérer les participants et mettre à jour l'état du séjour
    const fetchStayParticipants = async () => {
        try {
            setLoading(true);
            const response = await getTotalParticipants(stayId);
            console.log("Participants récupérés :", response.data);

            if (Array.isArray(response.data.participants_list)) {
                // Dispatcher la mise à jour des participants
                dispatch(setStayRequests({
                    stay_id: stayId, 
                    participants: response.data.participants_list
                }));

                // Mettre à jour les détails des participants et du statut du séjour
                dispatch(updateStayParticipants({
                    stay_id: stayId,
                    participants: response.data.participants_list
                }));
            } else {
                throw new Error("Les participants ne sont pas sous la forme attendue.");
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des participants :", err);
            setError("Erreur lors de la récupération des participants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Fetching participants for stay:", stayId);
        fetchStayParticipants();
    }, [stayId, dispatch]);

    useEffect(() => {
        setTimeout(() => {
            console.log("Stay Requests après le délai:", stayRequests, stayParticipants);
        }, 500);
    }, [stayRequests]);

    // Ajouter un participant
    const handleAddParticipant = async () => {
        if (!newParticipant.name || newParticipant.people_number <= 0) {
            setError("Veuillez entrer un nom et un nombre valide.");
            return;
        }

        try {
            const response = await addStayParticipant(stayId, newParticipant);
            if (response.status === 200) {
                setNewParticipant({ name: "", people_number: 0 });
                fetchStayParticipants(); // Récupérer les participants après l'ajout
            }
        } catch (err) {
            setError("Erreur lors de l'ajout du participant.");
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>{error}</div>; // Affichage de l'erreur

    return (
        <div>
            <h1>Détails du séjour : {selectedStay?.title}</h1>
            <p>{selectedStay?.description}</p>
            <p>Status actuel : {selectedStay?.status}</p>
            <p>Participants totaux : {stayParticipants ? stayParticipants.totalParticipants : "Chargement..."}</p>

            <div>
                {selectedStay?.status === "validé" && <p>Le séjour est validé !</p>}
                {selectedStay?.status === "en_attente" && <p>Le séjour est en attente de participants.</p>}
                {selectedStay?.status === "en_attente_de_validation" && (
                    <p>Le séjour attend la validation du guide.</p>
                )}
            </div>

            {/* Ajouter un participant */}
            <div>
                <h3>Ajouter un participant</h3>
                <input
                    type="text"
                    placeholder="Nom du participant"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Nombre d'accompagnants"
                    value={newParticipant.people_number}
                    onChange={(e) => setNewParticipant({ ...newParticipant, people_number: Number(e.target.value) })}
                />
                <button onClick={handleAddParticipant}>Ajouter</button>
            </div>

            {/* Liste des participants */}
            <div>
                <h3>Participants actuels</h3>
                <ul>
                    {stayRequests.map((participant) => (
                        <li key={participant.participant_id}>
                        {participant.participant.firstname} {participant.participant.lastname} et { }
                        {participant.people_number} accompagnants.
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Test;
