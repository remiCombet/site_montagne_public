import React, { useEffect, useState } from 'react';

const Demo = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Diviser le texte en mots individuels
  const text = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi vitae at ex dolorum dolore laborum minus! Ex architecto facere nihil. Labore molestiae animi corporis. Eveniet porro itaque qui totam? Incidunt.";
  
  const words = text.split(' ');
  
  // Créer un tableau de spans avec des classes différentes
  const styledWords = words.map((word, index) => {
    // Déterminer la classe de couleur selon la position
    let colorClass = '';
    if (index < 5) {
      colorClass = 'word-red';
    } else if (index < 10) {
      colorClass = 'word-green';
    } else if (index < 15) {
      colorClass = 'word-yellow';
    } else if (index < 20) {
      colorClass = 'word-blue';
    } else {
      colorClass = 'word-purple';
    }
    
    // Déterminer si le mot doit être en gras (un sur trois)
    const boldClass = (index % 3 === 0) ? 'word-bold' : '';
    
    return (
      <span key={index} className={`word ${colorClass} ${boldClass}`}>
        {word}{' '}
      </span>
    );
  });

  // Effet pour simuler le chargement de l'image
  useEffect(() => {
    const timer = setTimeout(() => {
      setImageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="demo-container">
      <div className="demo-content">
        <div className={`image-container ${imageLoaded ? 'loaded' : ''}`}>
          <h3>Image de montagne</h3>
          <img 
            src="https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png" 
            alt="Image de montagne" 
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        <div className="text-container">
          <h3>Texte avec mise en forme</h3>
          <p>{styledWords}</p>
        </div>
      </div>
    </div>
  );
};

export default Demo;
