import React, { useState } from 'react';
import './TestForm.css';

const TestForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Formulaire envoyé avec succès!\n${JSON.stringify(formData, null, 2)}`);
  };

  return (
    <div className="test-form-wrapper">
      <h2>Formulaire de Test</h2>
      <form onSubmit={handleSubmit} className="test-form">
        <div className="test-form-grid">
          <div className="test-field-container">
            <label htmlFor="firstname">Prénom</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="test-field-container">
            <label htmlFor="lastname">Nom</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="test-field-container full-width">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <button type="submit" className="test-submit-btn">
          Tester l'envoi
        </button>
      </form>
    </div>
  );
};

export default TestForm;