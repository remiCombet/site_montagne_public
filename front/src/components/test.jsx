import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStayStepByStayId } from '../api/stayStep';
import { selectStay, setSelectedStay } from '../slices/staySlice';

const Test = () => {
    const dispatch = useDispatch();
    const { selectedStay } = useSelector(selectStay);
    console.log(selectedStay)
     const [staySteps, setStaySteps] = useState([]);

     useEffect(() => {
        // Chargement des étapes du séjour via l'API
        // getStayStepByStayId(selectedStay.id)
        // .then((res) => {
        //     console.log(res.staySteps)
        //     if (res.status === 200) {
        //         console.log(res.staySteps);
        //         setStaySteps(res.staySteps);
        //     } else {
        //         console.error("Erreur lors de la récupération des étapes du séjour");
        //     }
        // })
        // .catch((err) => {
        //     console.error("Erreur lors du chargement des étapes du séjour", err);
        // });
     })
  return (
    <div>
      <Link to="/">retour a l'accueil</Link>
    </div>
  )
}

export default Test;
