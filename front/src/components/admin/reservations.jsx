import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectStays, 
  selectStayRequests, 
  setStayRequests, 
  updateStayRequest,
  selectRequestsByStayId,
  updateStayParticipants
} from '../../slices/staySlice';
import { getAllStayRequests, updateStayRequestStatus } from '../../api/admin/stayRequest';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const Reservations = () => {
  const dispatch = useDispatch();
  
  // Utilisation des sélecteurs Redux
  const stays = useSelector(selectStays);
  const stayRequests = useSelector(selectStayRequests);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('en_attente');

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
        console.log(res)
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

  return (
    <div className="reservations-container">
      <h2>Gestion des demandes de réservation</h2>
      
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {message.text}
        </div>
      )}
      
      <div className="filters">
        <div className="filter-buttons">
          <button 
            className={filter === 'en_attente' ? 'active' : ''} 
            onClick={() => setFilter('en_attente')}
          >
            En attente
          </button>
          <button 
            className={filter === 'validé' ? 'active' : ''} 
            onClick={() => setFilter('validé')}
          >
            Validées
          </button>
          <button 
            className={filter === 'refusé' ? 'active' : ''} 
            onClick={() => setFilter('refusé')}
          >
            Refusées
          </button>
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
        </div>
        
        <button className="refresh-btn" onClick={loadStayRequests}>
          ↻ Rafraîchir
        </button>
      </div>
      
      <div className="stats-summary">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total demandes</span>
            <span className="stat-value">{stats.totalRequests}</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-label">En attente</span>
            <span className="stat-value">{stats.pendingRequests}</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-label">Validées</span>
            <span className="stat-value">{stats.approvedRequests}</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-label">Refusées</span>
            <span className="stat-value">{stats.rejectedRequests}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Personnes confirmées</span>
            <span className="stat-value">{stats.confirmedPeople}/{stats.totalPeople}</span>
          </div>
        </div>
      </div>
      
      <div className="requests-table-container">
        {filteredRequests.length > 0 ? (
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Séjour</th>
                <th>Participant</th>
                <th>Commentaire</th>
                <th>Personnes</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className={`status-${request.status}`}>
                  <td>{request.id}</td>
                  <td>{formatDate(request.created_at)}</td>
                  <td>
                    <div className="stay-cell">
                      <span className="stay-name">{request.stayName}</span>
                      {request.stayStartDate && request.stayEndDate && (
                        <span className="stay-dates">
                          {format(parseISO(request.stayStartDate), 'dd/MM/yyyy', { locale: fr })} 
                          - 
                          {format(parseISO(request.stayEndDate), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{request.participant_id}</td>
                  <td className="comment-cell">{request.comment || '-'}</td>
                  <td className="people-cell">{request.people_number}</td>
                  <td>
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
                          Mettre en attente
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleStatusChange(request.id, request.stay_id, 'refusé')}
                        >
                          Refuser
                        </button>
                      </>
                    ) : ( // Si c'est refusé
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
                          Mettre en attente
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-requests">
            <p>{filter === 'all' ? 'Aucune demande trouvée' : `Aucune demande avec le statut "${filter}"`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;