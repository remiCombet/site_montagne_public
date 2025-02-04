import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectStay, setSelectedStay } from '../../slices/staySlice';
import { setHighlights, selectHighlights } from '../../slices/highlightSlice';
import { getHighlightsByStay } from '../../api/highlights';
import { getStayStepByStayId } from '../../api/stayStep';
import { format } from 'date-fns';
// import { getAccessByStayId } from '../../api/stayAccess';
// import { getAccommodationByStepId } from '../../api/accommodation';
import StayStep from '../../components/stayStep';
import Access from '../../components/access';
import Reception from '../../components/reception';

const StayDetails = () => {
    const { selectedStay } = useSelector(selectStay);
    const { highlights } = useSelector(selectHighlights);
    const dispatch = useDispatch();
    
    // State pour stocker les étapes de séjour
    const [staySteps, setStaySteps] = useState([]);

    // State pour gérer l'onglet sélectionné
    const [activeTab, setActiveTab] = useState('resume');

    useEffect(() => {
        if (selectedStay && selectedStay.id) {

            // Chargement des points forts via l'API
            getHighlightsByStay(selectedStay.id)
            .then((res) => {
                if (res && res.highlights && Array.isArray(res.highlights) && res.highlights.length > 0) {
                    dispatch(setHighlights(res.highlights));
                } else {
                    console.error("Aucun highlight trouvé ou mauvaise structure de données.");
                }
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des points forts", err);
            });

            // Chargement des étapes du séjour via l'API
            getStayStepByStayId(selectedStay.id)
            .then((res) => {
                if (res.status === 200) {
                    setStaySteps(res.staySteps);
                } else {
                    console.error("Erreur lors de la récupération des étapes du séjour");
                }
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des étapes du séjour", err);
            });
        }
    }, [selectedStay, dispatch]);

    const handleBackClick = () => {
        dispatch(setSelectedStay(null));
    };

    const formatStatus = (status) => {
        return status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    if (!selectedStay) {
        return <p>Chargement du séjour...</p>;
    }

    return (
        <div>
            <h2>Détails du séjour : {selectedStay.title}</h2>
            <p><strong>Description :</strong> {selectedStay.description}</p>
            <p><strong>Location :</strong> {selectedStay.location}</p>
            <p><strong>Prix :</strong> {selectedStay.price}€</p>
            <p>
                <strong>Date :</strong> 
                {' '} du {format(new Date(selectedStay.start_date), 'dd MMMM yyyy')} au{' '}
                {format(new Date(selectedStay.end_date), 'dd MMMM yyyy')}
            </p>

            <p>niveau physique : {selectedStay.physical_level}</p>
            <p>niveau technique : {selectedStay.technical_level}</p>
            <p>participant nécessaire pour que le séjour soit validé : {selectedStay.min_participant}</p>
            <p>nombre maximum de personnes : {selectedStay.max_participant}</p>
            <p>statut du séjour : {formatStatus(selectedStay.status)}</p>

            {/* Affichage des points forts */}
            {highlights && highlights.length > 0 ? (
                <div>
                    <h3>Points forts du séjour :</h3>
                    <ul>
                        {highlights.map((highlight) => (
                            <li key={highlight.id}>
                                <strong>{highlight.title}</strong>: {highlight.description}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Aucun point positif pour ce séjour.</p>
            )}

            {/* Affichage des étapes du séjour */}
            {staySteps.length > 0 ? (
                <StayStep staySteps={staySteps}/>
            ) : (
                <p>Aucune étape disponible pour ce séjour.</p>
            )}

                {/* Fiche technique */}
                <div>
                <h3>Fiche technique</h3>
                <div className="tabs">
                    <button onClick={() => setActiveTab('resume')} className={activeTab === 'resume' ? 'active' : ''}>Résumé</button>
                    <button onClick={() => setActiveTab('access')} className={activeTab === 'access' ? 'active' : ''}>Accueil / Accès</button>
                    <button onClick={() => setActiveTab('equipment')} className={activeTab === 'equipment' ? 'active' : ''}>Équipement</button>
                </div>

                <div className="tab-content">
                    {activeTab === 'resume' && (
                        <div>
                            <h4>Résumé</h4>
                            <p>{selectedStay.description}</p>
                        </div>
                    )}
                    {activeTab === 'access' && (
                        <div>
                            <Reception receptionPointId={selectedStay.reception_point_id}/>
                            <Access stayId={selectedStay.id} />
                        </div>
                    )}
                    {activeTab === 'equipment' && (
                        <div>
                            <h4>Équipement</h4>
                            <p>Liste des équipements nécessaires pour ce séjour...</p>
                        </div>
                    )}
                </div>
            </div>

            <Link onClick={handleBackClick} to="/stays">Retour à la liste des séjours</Link>
        </div>
    );
};

export default StayDetails;
