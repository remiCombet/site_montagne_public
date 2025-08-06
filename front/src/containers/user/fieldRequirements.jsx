import { useState, useEffect } from 'react';

const FieldRequirements = ({ fieldType, value, isFocused = false }) => {
  // Configuration des exigences par type de champ
  const requirementConfigs = {
    name: [
      {
        id: 'min-length',
        test: val => val.length >= 2,
        message: 'Au moins 2 caractères'
      },
      {
        id: 'max-length',
        test: val => val.length <= 50,
        message: 'Maximum 50 caractères'
      }
    ],
    email: [
      {
        id: 'valid-format',
        test: val => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val),
        message: 'Format d\'email valide (exemple@domaine.com)'
      }
    ],
    // Exigences de mot de passe regroupées
    password: [
      {
        id: 'min-length',
        test: val => val.length >= 8,
        message: 'Au moins 8 caractères'
      },
      {
        id: 'chars-mix',
        // Combine majuscule + minuscule en une seule exigence
        test: val => /[A-Z]/.test(val) && /[a-z]/.test(val),
        message: 'Mélange de majuscules et minuscules'
      },
      {
        id: 'numbers-special',
        // Combine chiffres + caractères spéciaux en une seule exigence
        test: val => /[0-9]/.test(val) && /[#?!@$%^&*-]/.test(val),
        message: 'Au moins un chiffre et un caractère spécial'
      }
    ],
    phone: [
      {
        id: 'valid-format',
        test: val => /^\d{10,15}$/.test(val),
        message: 'Entre 10 et 15 chiffres'
      }
    ]
  };

  // Reste du code inchangé...
  const requirements = requirementConfigs[fieldType] || [];
  const [satisfied, setSatisfied] = useState({});
  const [allSatisfied, setAllSatisfied] = useState(false);

  useEffect(() => {
    const newSatisfied = {};
    let allMet = true;
    
    requirements.forEach(req => {
      const isSatisfied = req.test(value);
      newSatisfied[req.id] = isSatisfied;
      if (!isSatisfied) allMet = false;
    });
    
    setSatisfied(newSatisfied);
    setAllSatisfied(allMet);
  }, [value, fieldType]);

  if (requirements.length === 0) return null;
  const shouldShow = isFocused || (value && !allSatisfied);

  return (
    <div className={`field-requirements ${shouldShow ? 'visible' : 'hidden'}`}>
      <h4>Exigences:</h4>
      <ul>
        {requirements.map(req => (
          <li 
            key={req.id} 
            className={satisfied[req.id] ? 'satisfied' : ''}
          >
            {req.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FieldRequirements;