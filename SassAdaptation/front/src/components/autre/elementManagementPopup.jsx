import React, { useState, useEffect } from 'react';
import Popup from './popup';
import axios from 'axios';

const ElementManagementPopup = ({ elementType, stayId, onClose }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [newElement, setNewElement] = useState('');

  useEffect(() => {
    // Récupérer les éléments associés au séjour selon le type d'élément
    axios.get(`/api/stays/${stayId}/${elementType}`)
      .then(response => {
        setElements(response.data);
      })
      .catch(error => {
        console.error(`Erreur lors du chargement des ${elementType}:`, error);
      });
  }, [stayId, elementType]);

  const handleAddElement = () => {
    // Ajouter un élément existant au séjour
    axios.post(`/api/stays/${stayId}/add-${elementType}`, { elementId: selectedElement })
      .then(() => {
        console.log(`${elementType} ajouté`);
        onClose(); // Fermer le popup après l'ajout
      })
      .catch(error => {
        console.error(`Erreur lors de l'ajout du ${elementType}:`, error);
      });
  };

  const handleCreateElement = () => {
    // Créer un nouvel élément et l'ajouter au séjour
    axios.post(`/api/${elementType}`, { name: newElement })
      .then(response => {
        // Ajouter ensuite le nouvel élément au séjour
        axios.post(`/api/stays/${stayId}/add-${elementType}`, { elementId: response.data.id })
          .then(() => {
            console.log(`Nouveau ${elementType} créé et ajouté`);
            onClose(); // Fermer le popup après la création
          });
      })
      .catch(error => {
        console.error(`Erreur lors de la création du ${elementType}:`, error);
      });
  };

  return (
    <Popup title={`Gestion des ${elementType}`} onClose={onClose}>
      <div>
        <h3>Ajouter un {elementType} existant</h3>
        <select onChange={e => setSelectedElement(e.target.value)} value={selectedElement}>
          <option value="">Choisir un {elementType}</option>
          {elements.map(element => (
            <option key={element.id} value={element.id}>{element.name}</option>
          ))}
        </select>
        <button onClick={handleAddElement} disabled={!selectedElement}>Ajouter</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Créer un nouveau {elementType}</h3>
        <input
          type="text"
          placeholder={`Nom du ${elementType}`}
          value={newElement}
          onChange={e => setNewElement(e.target.value)}
        />
        <button onClick={handleCreateElement} disabled={!newElement}>Créer et Ajouter</button>
      </div>
    </Popup>
  );
};

export default ElementManagementPopup;
