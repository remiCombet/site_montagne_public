import React from 'react';
import StayCardTest from './stayCardTest';

const StayListTest = ({ stays, onStaySelect, selectedStay, onStayDeselect, onMessage }) => {
    return (
        <section className="stays-list-container">
            {stays.length > 0 ? (
                <ul className="stays-list">
                    {stays.map((stay) => (
                        <li key={stay.id}>
                            <StayCardTest
                                stay={stay}
                                isSelected={stay.id === selectedStay?.id}
                                onSelect={onStaySelect}
                                onDeselect={onStayDeselect}
                                onMessage={onMessage}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun séjour disponible.</p>
            )}
        </section>
    );
};

export default StayListTest;
