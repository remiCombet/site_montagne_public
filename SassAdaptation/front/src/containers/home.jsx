import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setStays } from '../slices/staySlice';
import { getAllStays } from '../api/stay';

import FeaturedStays from '../components/affichage/FeaturedStays';
import LastChanceStays from '../components/affichage/LastChanceStays';
// import StayList from '../components/stayList';

const home = () => {
  const dispatch = useDispatch();
  const stays = useSelector((state) => state.stay.stays);

  useEffect(() => {
    // chargement des séjours
    getAllStays()
    .then((res) => {
      if (res && res.stays) {
        console.log("Séjours chargés", res.stays);
        dispatch(setStays(res.stays));
      }
    })
    .catch((err) => {
      console.error("Erreur lors du chargement des séjours", err);
    });
  }, []);

  return (
    <div>
      
      
      <br/>
      {/* <Link to="/test">test</Link> */}
      {/* <div className="stays-list">
        {stays && stays.length > 0 ? (
          stays.map((stay) => (
            <StayCard key={stay.id} stay={stay} />  // Affichage des cartes de séjour
          ))
        ) : (
          <p>Aucun séjour disponible</p>
        )}
      </div> */}
      {/* <div className="stays-list">
        {stays && stays.length > 0 ? (
          stays.map((stay) => (
            <div key={stay.id} className="stay-item">
              <h3>{stay.title}</h3>
              <p><strong>Description :</strong> {stay.description}</p>
              <p><strong>Location :</strong> {stay.location}</p>
              <p><strong>Prix :</strong> {stay.price}€</p>
              <p><strong>Date :</strong> {stay.start_date} - {stay.end_date}</p>
              <p><strong>Participants minimum :</strong> {stay.min_participant}</p>
              <p><strong>Participants maximum :</strong> {stay.max_participant}</p>
            </div>
          ))
        ) : (
          <p>Aucun séjour disponible</p>
        )}
      </div> */}

      <FeaturedStays stays={stays}/>
      <LastChanceStays stays={stays}/>

      <div>
      {/* <Link to="/test">test</Link> */}
      </div>
    </div>
  )
}

export default home
