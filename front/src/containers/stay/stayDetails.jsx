import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// appel des fonctionnalités des Reducer
import { setSelectedStay } from '../../slices/staySlice';
import { setHighlights, selectHighlights } from '../../slices/highlightSlice';

// appels API
import { getHighlightsByStay } from '../../api/highlights';
import { getStayStepByStayId } from '../../api/stayStep';
import { getThemeByStayId } from '../../api/stayTheme';

// importationdes composants
import StayStep from '../../components/stayStep';
import Access from '../../components/access';
import Reception from '../../components/reception';
import Equipment from '../../components/equipment';
import ToPrepare from '../../components/toPrepare';
import StayTheme from '../../components/stayTheme';
import Test from '../../components/test';

const StayDetails = () => {
    const stays = useSelector((state) => state.stay.stays);
    const selectedStay = useSelector((state) => state.stay.selectedStay);
    const { highlights } = useSelector(selectHighlights);
    const dispatch = useDispatch();
    
    // State pour stocker localement les données
    const [staySteps, setStaySteps] = useState([]);
    const [stayThemes, setStayThemes] = useState([]);

    // State pour stocker les étapes de séjour
    

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

            // Chargement des thèmes du séjour via l'API
            getThemeByStayId(selectedStay.id)
            .then((res) => {
                if (res.status === 200) {
                    setStayThemes(res.themes);
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

            {/* Affichage des thèmes du séjour */}
            {stayThemes.length > 0 ? (
                <div>
                    <h3>Thèmes du séjour :</h3>
                    <ul>
                        {stayThemes.map((theme) => (
                            <li key={theme.id}>
                                <strong>{theme.name}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Aucun thème associé à ce séjour.</p>
            )}

             {/* Intégration du composant Test */}
             <Test stayId={selectedStay.id} />

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
                            <h4>Équipements</h4>
                            <Equipment stayId={selectedStay.id} />
                            <ToPrepare stayId={selectedStay.id} />
                        </div>
                    )}
                </div>
            </div>

            <Link onClick={handleBackClick} to="/stays">Retour à la liste des séjours</Link>
        </div>
    );
};

export default StayDetails;
