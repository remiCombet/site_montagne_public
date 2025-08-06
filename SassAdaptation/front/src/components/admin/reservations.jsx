import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectStays, 
  selectStayRequests, 
  setStayRequests, 
  updateStayRequest,
  updateStayStore,
  updateStayParticipants
} from '../../slices/staySlice';
import { getAllStayRequests, updateStayRequestStatus } from '../../api/admin/stayRequest';
import { updateStayStatus } from '../../api/admin/stay';
// @ts-ignore
import { decodeHTML, deepDecodeHTML } from '../../utils/decodeHtml';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import MessagePopup from './messagePopup';

const Reservations = () => {
  const dispatch = useDispatch();
  
  // Utilisation des sélecteurs Redux
  const stays = useSelector(selectStays);
  const stayRequests = useSelector(selectStayRequests);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('en_attente');
  const [activeView, setActiveView] = useState('pending');

  useEffect(() => {
    loadStayRequests();
  }, [dispatch]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadStayRequests = () => {
    getAllStayRequests()
      .then(res => {
        // Créer un objet pour stocker les participants par stay_id
        const stayData = {};

        res.data.forEach(req => {
          if (!stayData[req.stay_id]) {
            stayData[req.stay_id] = [];
          }

          stayData[req.stay_id].push({
            id: req.id,
            status: req.status,
            comment: req.comment,
            people_number: req.people_number,
            stay_id: req.stay_id,
            participant_id: req.participant_id,
            participant_name: req.participant ? `${req.participant.firstname} ${req.participant.lastname}` : 'N/A',
            created_at: req.created_at,
            updated_at: req.updated_at
          });
        });

        // Mettre à jour Redux
        Object.keys(stayData).forEach(stay_id => {
          dispatch(setStayRequests({ stay_id, participants: stayData[stay_id] }));
        });
      })
      .catch(err => {
        console.error("Erreur lors du chargement des réservations :", err);
        setMessage({ type: 'error', text: "Erreur lors du chargement des réservations" });
      });
  };

  const handleStatusChange = (requestId, stayId, newStatus) => {
    updateStayRequestStatus(requestId, newStatus)
      .then(res => {
        if (res.status === 200) {
          // 1. Mettre à jour la demande de séjour dans le store
          dispatch(updateStayRequest({ 
            stay_id: parseInt(stayId), 
            request_id: requestId, 
            status: newStatus 
          }));

          // 2. Récupérer les participants de ce séjour après la mise à jour
          const stayParticipants = stayRequests[stayId] || [];

          // 3. Mise à jour des statistiques du séjour (participants validés, etc.)
          dispatch(updateStayParticipants({
            stay_id: parseInt(stayId),
            participants: stayParticipants.map(p => {
              // Si c'est la demande qu'on vient de mettre à jour, utiliser le nouveau statut
              if (p.id === requestId) {
                return { ...p, status: newStatus };
              }
              return p;
            })
          }));

          // Afficher un message de succès
          setMessage({ 
            type: 'success', 
            text: newStatus === 'validé' ? "Demande validée avec succès" : 
                  newStatus === 'refusé' ? "Demande refusée" : "Statut mis à jour"
          });
        } else {
          setMessage({ type: 'error', text: "Erreur lors du changement de statut" });
        }  
      })
      .catch(err => {
        console.error("Erreur lors du changement de statut:", err);
        setMessage({ type: 'error', text: "Erreur lors du changement de statut" });
      });
  };

  // 1. Adapter la fonction handleStayStatusChange pour ne plus utiliser status_manually_set
  const handleStayStatusChange = (stayId, newStatus) => {
    // Appel API pour mettre à jour le statut du séjour
    updateStayStatus(stayId, newStatus)
      .then(res => {
        if (res.status === 200) {
          // Mettre à jour uniquement le statut administratif dans Redux
          dispatch(updateStayStore({
            id: stayId,
            status: newStatus
            // On n'a plus besoin de status_manually_set
          }));
          
          setMessage({ 
            type: 'success', 
            text: `Statut du séjour mis à jour : ${getStatusLabel(newStatus)}`
          });
  
          // Recharger les données pour s'assurer que tout est synchronisé
          loadStayRequests();
        } else {
          setMessage({ type: 'error', text: "Erreur lors de la mise à jour du statut du séjour" });
        }
      })
      .catch(err => {
        console.error("Erreur lors de la mise à jour du statut du séjour:", err);
        setMessage({ type: 'error', text: "Erreur lors de la mise à jour du statut du séjour" });
      });
  };

  // 2. Séparer les fonctions pour obtenir les libellés de chaque type de statut
  const getFillStatusLabel = (fillStatus) => {
    switch(fillStatus) {
      case 'participants_insuffisants': return 'Insuffisant';
      case 'en_attente_de_validation': return 'Suffisant';
      case 'complet': return 'Complet';
      default: return fillStatus;
    }
  };

  const getAdminStatusLabel = (status) => {
    switch(status) {
      case 'en_attente': return 'En attente';
      case 'validé': return 'Validé';
      case 'refusé': return 'Refusé';
      case 'annulé': return 'Annulé';
      default: return status;
    }
  };

  // Traduire les statuts en libellés plus lisibles
  const getStatusLabel = (status) => {
    switch(status) {
      case 'en_attente_de_validation': return 'En attente de validation';
      case 'participants_insuffisants': return 'Participants insuffisants';
      case 'complet': return 'Complet';
      case 'validé': return 'Validé';
      case 'refusé': return 'Refusé';
      case 'annulé': return 'Annulé';
      default: return status;
    }
  };

  // Formater la date avec date-fns
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  // Récupérer toutes les demandes sous forme de liste plate
  const getAllRequests = () => {
    const allRequests = [];
    
    Object.keys(stayRequests).forEach(stayId => {
      const requests = stayRequests[stayId] || [];
      
      requests.forEach(request => {
        const numericStayId = parseInt(stayId);
        const stayInfo = stays.find(s => s.id === numericStayId) || {};
        
        allRequests.push({
          ...request,
          stayName: stayInfo.title || `Séjour #${stayId}`,
          stayStartDate: stayInfo.start_date,
          stayEndDate: stayInfo.end_date,
          total_people: request.total_people || (1 + parseInt(request.people_number || 0))
        });
      });
    });
    
    return allRequests;
  };

  // Filtrer les demandes selon le statut sélectionné
  const getFilteredRequests = () => {
    const allRequests = getAllRequests();
    
    if (filter === 'all') {
      return allRequests;
    }
    
    return allRequests.filter(request => request.status === filter);
  };

  const filteredRequests = getFilteredRequests();

  // Calculer les statistiques des demandes avec le comptage correct des personnes
  const calculateStats = () => {
    let totalRequests = 0;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let totalPeople = 0;
    let confirmedPeople = 0;

    Object.keys(stayRequests).forEach(stayId => {
      const requests = stayRequests[stayId] || [];
      
      totalRequests += requests.length;
      pendingRequests += requests.filter(r => r.status === 'en_attente').length;
      approvedRequests += requests.filter(r => r.status === 'validé').length;
      rejectedRequests += requests.filter(r => r.status === 'refusé').length;
      
      // Calcul du nombre de personnes: 1 (demandeur) + accompagnants pour chaque demande
      totalPeople += requests.reduce((sum, req) => {
        return sum + (req.total_people || (1 + parseInt(req.people_number || 0)));
      }, 0);
      
      confirmedPeople += requests
        .filter(r => r.status === 'validé')
        .reduce((sum, req) => {
          return sum + (req.total_people || (1 + parseInt(req.people_number || 0)));
        }, 0);
    });

    return {
      totalRequests,
      pendingRequests,
      approvedRequests, 
      rejectedRequests,
      totalPeople,
      confirmedPeople
    };
  };

  const stats = calculateStats();

  // Fonction pour grouper les demandes par séjour
  const getStayGroups = () => {
    const stayGroups = [];
    
    // Récupérer tous les séjours qui ont des demandes
    const staysWithRequests = stays.filter(stay => stayRequests[stay.id]);
    
    staysWithRequests.forEach(stay => {
      const requests = stayRequests[stay.id] || [];
      
      // Calculer les statistiques par séjour
      const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'en_attente').length,
        approved: requests.filter(r => r.status === 'validé').length,
        rejected: requests.filter(r => r.status === 'refusé').length,
        totalPeople: requests.reduce((sum, req) => {
          return sum + (1 + parseInt(req.people_number || 0));
        }, 0),
        confirmedPeople: requests
          .filter(r => r.status === 'validé')
          .reduce((sum, req) => {
            return sum + (1 + parseInt(req.people_number || 0));
          }, 0)
      };
      
      // Enrichir les demandes avec des infos supplémentaires
      const enrichedRequests = requests.map(request => ({
        ...request,
        stayName: stay.title,
        stayStartDate: stay.start_date,
        stayEndDate: stay.end_date,
        total_people: 1 + parseInt(request.people_number || 0)
      }));
      
      stayGroups.push({
        stay,
        stats,
        requests: enrichedRequests
      });
    });
    
    return stayGroups;
  };

  const pendingRequests = getAllRequests().filter(request => request.status === 'en_attente');
  const stayGroups = getStayGroups();
  
  // Ajouter une fonction pour obtenir l'état de remplissage d'un séjour
  const getFillStatus = (stay, confirmedPeople) => {
    if (confirmedPeople < stay.min_participant) {
      return "participants_insuffisants";
    } else if (confirmedPeople >= stay.max_participant) {
      return "complet";
    } else {
      return "en_attente_de_validation";
    }
  };

  return (
    <section className="reservations">
      <h2>Gestion des demandes de réservation</h2>
      
      <MessagePopup 
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ type: '', text: '' })}
      />
      
      <nav className="view-tabs">
        <button className={activeView === 'pending' ? 'active' : ''} onClick={() => setActiveView('pending')}>
          Demandes en attente ({stats.pendingRequests})
        </button>
        <button className={activeView === 'by_stay' ? 'active' : ''} onClick={() => setActiveView('by_stay')}>
          Par séjour ({stays.length})
        </button>
      </nav>
      
      {activeView === 'pending' && (
        <section className="pending-requests">
          <article className="stats-summary">
            <ul className="stats-grid">
              <li className="stat-item pending">
                <span className="stat-label">En attente : </span>
                <span className="stat-value">{stats.pendingRequests}</span>
              </li>
              <li className="stat-item approved">
                <span className="stat-label">Validées : </span>
                <span className="stat-value">{stats.approvedRequests}</span>
              </li>
              <li className="stat-item rejected">
                <span className="stat-label">Refusées : </span>
                <span className="stat-value">{stats.rejectedRequests}</span>
              </li>
              <li className="stat-item">
                <span className="stat-label">Total : </span>
                <span className="stat-value">{stats.totalRequests}</span>
              </li>
            </ul>
          </article>
          
          <h3>Demandes en attente de validation</h3>
          
          <article className="requests-list">
            {pendingRequests.length > 0 ? (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Séjour</th>
                    <th>Participant</th>
                    <th>Commentaire</th>
                    <th>Nombre de Personnes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td data-label="Date">{formatDate(request.created_at)}</td>
                      <td>
                        <div className="stay-cell">
                          <span className="stay-name">{deepDecodeHTML(request.stayName)}</span>
                          {request.stayStartDate && request.stayEndDate && (
                            <span className="stay-dates">
                              {format(parseISO(request.stayStartDate), 'dd/MM/yyyy', { locale: fr })} 
                              - 
                              {format(parseISO(request.stayEndDate), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{request.participant_name}</td>
                      <td className="comment-cell">{request.comment ? decodeHTML(request.comment) : '-'}</td>
                      <td className="people-cell">{request.total_people}</td>
                      <td className="actions-cell">
                        <button 
                          className="approve-btn"
                          onClick={() => handleStatusChange(request.id, request.stay_id, 'validé')}
                        >
                          Valider
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleStatusChange(request.id, request.stay_id, 'refusé')}
                        >
                          Refuser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-requests">Aucune demande en attente</p>
            )}
          </article>
        </section>
      )}
      
      {activeView === 'by_stay' && (
        <section className="stays-list">
          {stayGroups.length > 0 ? (
            stayGroups.map(group => (
              <article key={group.stay.id} className="stay-item">
                <header className="stay-header">
                  <h3>{deepDecodeHTML(group.stay.title)}</h3>
                  <aside className="stay-meta">
                    <time className="stay-dates">
                      {format(parseISO(group.stay.start_date), 'dd/MM/yyyy', { locale: fr })} 
                      - 
                      {format(parseISO(group.stay.end_date), 'dd/MM/yyyy', { locale: fr })}
                    </time>
                    
                    {(() => {
                      const calculatedFillStatus = getFillStatus(group.stay, group.stats.confirmedPeople);
                      const displayedFillStatus = group.stay.fill_status || calculatedFillStatus;
                      
                      // console.log('État de remplissage :', {
                      //   stayId: group.stay.id,
                      //   titre: group.stay.title,
                      //   confirmedPeople: group.stats.confirmedPeople,
                      //   storedFillStatus: group.stay.fill_status,
                      //   calculatedFillStatus: calculatedFillStatus,
                      //   displayedFillStatus: displayedFillStatus
                      // });
                      
                      return (
                        <span className={`fill-status ${getFillStatus(group.stay, group.stats.confirmedPeople)}`}>
                          {getFillStatusLabel(getFillStatus(group.stay, group.stats.confirmedPeople))}
                        </span>
                      );
                    })()}
                    
                    <span className={`admin-status ${group.stay.status}`}>
                      {getAdminStatusLabel(group.stay.status)}
                    </span>
                  </aside>
                </header>
                
                <section className="stay-details">
                  <ul className="stay-stats">
                    <li className="stat-box">
                      <span className="label">Demandes : </span>
                      <span className="value">{group.stats.total}</span>
                    </li>
                    <li className="stat-box">
                      <span className="label">En attente : </span>
                      <span className="value">{group.stats.pending}</span>
                    </li>
                    <li className="stat-box">
                      <span className="label">Validées : </span>
                      <span className="value">{group.stats.approved}</span>
                    </li>
                    <li className="stat-box">
                      <span className="label">Refusées : </span>
                      <span className="value">{group.stats.rejected}</span>
                    </li>
                    <li className="stat-box">
                      <span className="label">Min/Max : </span>
                      <span className="value">{group.stay.min_participant}/{group.stay.max_participant}</span>
                    </li>
                    <li className="stat-box">
                      <span className="label">Confirmés/Total : </span>
                      <span className="value">{group.stats.confirmedPeople}/{group.stats.totalPeople}</span>
                    </li>
                  </ul>
                  
                  <article className="requests-list stay-requests">
                    <table className="requests-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Participant</th>
                          <th>Commentaire</th>
                          <th>Personnes</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.requests.map((request) => (
                          <tr key={request.id} className={`status-${request.status}`}>
                            <td data-label="Date">{formatDate(request.created_at)}</td>
                            <td data-label="Participant">{request.participant_name}</td>
                            <td data-label="Commentaire" className="comment-cell">
                              {request.comment ? decodeHTML(request.comment) : '-'}
                            </td>
                            <td data-label="Personnes" className="people-cell">
                              {request.total_people}
                            </td>
                            <td data-label="Statut">
                              <span className={`status-badge ${request.status}`}>
                                {request.status === 'en_attente' ? 'En attente' : 
                                  request.status === 'validé' ? 'Validé' : 'Refusé'}
                              </span>
                            </td>
                            <td className="actions-cell">
                              {request.status === 'en_attente' ? (
                                <>
                                  <button 
                                    className="approve-btn"
                                    onClick={() => handleStatusChange(request.id, request.stay_id, 'validé')}
                                  >
                                    Valider
                                  </button>
                                  <button 
                                    className="reject-btn"
                                    onClick={() => handleStatusChange(request.id, request.stay_id, 'refusé')}
                                  >
                                    Refuser
                                  </button>
                                </>
                              ) : request.status === 'validé' ? (
                                <>
                                  <button 
                                    className="change-status-btn"
                                    onClick={() => handleStatusChange(request.id, request.stay_id, 'en_attente')}
                                  >
                                    Attente
                                  </button>
                                  <button 
                                    className="reject-btn"
                                    onClick={() => handleStatusChange(request.id, request.stay_id, 'refusé')}
                                  >
                                    Refuser
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    className="approve-btn"
                                    onClick={() => handleStatusChange(request.id, request.stay_id, 'validé')}
                                  >
                                    Valider
                                  </button>
                                  <button 
                                    className="change-status-btn"
                                    onClick={() => handleStatusChange(request.id, request.stay_id, 'en_attente')}
                                  >
                                    Attente
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </article>

                  <footer className="stay-status">
                    <h4>Gestion du statut du séjour</h4>
                    
                    <aside className="status-summary">
                      <ul className="status-box-container">
                        <li className="fill-status-box">
                          <span className="status-label">État de remplissage : </span>
                          <span className={`status-value ${getFillStatus(group.stay, group.stats.confirmedPeople)}`}>
                            {getFillStatusLabel(getFillStatus(group.stay, group.stats.confirmedPeople))}
                          </span>
                        </li>
                        
                        <li className="admin-status-box">
                          <span className="status-label">Statut administratif : </span>
                          <span className={`status-value ${group.stay.status}`}>
                            {getAdminStatusLabel(group.stay.status)}
                          </span>
                        </li>
                      </ul>

                      {(() => {
                        const currentFillStatus = getFillStatus(group.stay, group.stats.confirmedPeople);
                        
                        return (
                          <>
                            {currentFillStatus === 'participants_insuffisants' && (
                              <div className="status-info warning">
                                <i className="warning-icon">⚠️ </i>
                                <span>Ce séjour n'a pas assez de participants validés ({group.stats.confirmedPeople}/{group.stay.min_participant}).</span>
                              </div>
                            )}
                            {currentFillStatus === 'en_attente_de_validation' && group.stay.status === 'en_attente' && (
                              <div className="status-info info">
                                <i className="info-icon">ℹ️ </i>
                                <span>Ce séjour a atteint le nombre minimum de participants et peut être validé.</span>
                              </div>
                            )}
                            {currentFillStatus === 'complet' && (
                              <div className="status-info success">
                                <i className="success-icon">✓ </i>
                                <span>Ce séjour a atteint le nombre maximum de participants.</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </aside>
                      
                    <section className="status-actions">
                      <h5 className="action-title">Changer le statut du séjour :</h5>
                      
                      {group.stay.status === 'en_attente' ? (
                        <div className="action-buttons">
                          <button 
                            className="validate-stay-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'validé')}
                          >
                            Valider ce séjour
                          </button>
                          <button 
                            className="reject-stay-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'refusé')}
                          >
                            Refuser ce séjour
                          </button>
                        </div>
                      ) : group.stay.status === 'validé' ? (
                        <div className="action-buttons">
                          <button 
                            className="cancel-stay-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'annulé')}
                          >
                            Annuler ce séjour
                          </button>
                          <button 
                            className="revert-stay-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'en_attente')}
                          >
                            Remettre en attente
                          </button>
                        </div>
                      ) : group.stay.status === 'refusé' || group.stay.status === 'annulé' ? (
                        <div className="action-buttons">
                          <button 
                            className="validate-stay-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'validé')}
                          >
                            Valider ce séjour
                          </button>
                          <button 
                            className="revert-stay-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'en_attente')}
                          >
                            Remettre en attente
                          </button>
                        </div>
                      ) : null}

                      {group.stay.fill_status === 'participants_insuffisants' && group.stay.status === 'en_attente' && (
                        <div className="special-action-buttons">
                          <button 
                            className="force-validate-btn"
                            onClick={() => handleStayStatusChange(group.stay.id, 'validé')}
                            title="Forcer la validation même si le nombre minimum n'est pas atteint"
                          >
                            Valider malgré tout
                          </button>
                        </div>
                      )}
                    </section>
                  </footer>
                </section>
              </article>
            ))
          ) : (
            <p className="no-stays">Aucun séjour trouvé</p>
          )}
        </section>
      )}
    </section>
  );
};

export default Reservations;