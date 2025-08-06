import React from 'react';
import StayCardTest from './stayCardTest';

const StayListTest = ({ stays, onStaySelect, selectedStay, onStayDeselect }) => {
    return (
        <section>
            <p>debut</p>
            {stays.length > 0 ? (
                <ul>
                    {stays.map((stay) => (
                        <li key={stay.id}>
                            <StayCardTest
                                stay={stay}
                                isSelected={stay.id === selectedStay?.id}
                                onSelect={onStaySelect}
                                onDeselect={onStayDeselect}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun séjour disponible.</p>
            )}
            <p>fin</p>
        </section>
    );
};

export default StayListTest;
