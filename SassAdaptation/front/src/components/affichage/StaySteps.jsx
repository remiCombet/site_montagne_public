import React from 'react';
// import { decodeHTML } from '../../utils/decodeHTML';

const StaySteps = ({ steps, accommodations }) => {
    return (
        <section className="stay-content__steps">
            <h2 className="stay-content__title">Étapes du séjour</h2>
            {steps.length > 0 ? (
                <ul className="stay-content__steps-list">
                    {steps.map(step => (
                        <li key={step.id} className="stay-content__step-item">
                            <div className="stay-content__step-header">
                                <span className="stay-content__step-number">Étape {step.step_number}</span>
                                <h3 className="stay-content__step-title">{step.title}</h3>
                            </div>
                            <p className="stay-content__step-description">{step.description}</p>
                            
                            {/* Statistiques de l'étape */}
                            <div className="stay-content__step-stats">
                                {step.duration && (
                                    <span className="stay-content__step-duration">
                                        <span className="icon">⏱️</span> {step.duration} heures
                                    </span>
                                )}
                                <span className="stay-content__step-elevation">
                                    {step.elevation_gain > 0 && (
                                        <span className="elevation-gain">
                                            <span className="icon">⬆️</span> {step.elevation_gain}m
                                        </span>
                                    )}
                                    {step.elevation_loss > 0 && (
                                        <span className="elevation-loss">
                                            <span className="icon">⬇️</span> {step.elevation_loss}m
                                        </span>
                                    )}
                                </span>
                            </div>
                            
                            {/* Hébergement associé */}
                            {accommodations[step.id] && (
                                <div className="stay-content__accommodation">
                                    <h4 className="stay-content__accommodation-title">
                                        <span className="icon">🏠</span> {accommodations[step.id].name}
                                    </h4>
                                    <p className="stay-content__accommodation-description">
                                        {accommodations[step.id].description}
                                    </p>
                                    {(accommodations[step.id].meal_type || accommodations[step.id].meal_description) && (
                                        <div className="stay-content__accommodation-meal">
                                            <h5 className="stay-content__accommodation-meal-title">
                                                <span className="icon">🍽️</span> Restauration
                                            </h5>
                                            {accommodations[step.id].meal_type && (
                                                <p className="stay-content__accommodation-meal-type">
                                                    <strong>Type:</strong> {accommodations[step.id].meal_type}
                                                </p>
                                            )}
                                            {accommodations[step.id].meal_description && (
                                                <p className="stay-content__accommodation-meal-details">
                                                    {accommodations[step.id].meal_description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="stay-content__no-data">Aucune étape définie pour ce séjour.</p>
            )}
        </section>
    );
};

export default StaySteps;