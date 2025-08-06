import { useState, useEffect } from 'react';

const Test = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // URL de l'image Cloudinary
  const cloudinaryUrl = "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"; 
  
  // Vous pouvez remplacer par votre propre URL

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    // Préchargement de l'image
    const img = new Image();
    img.src = cloudinaryUrl;
    
    return () => {
      // Nettoyage
      img.onload = null;
      img.onerror = null;
    };
  }, [cloudinaryUrl]);

  return (
    <div className="test-component">
      <h1 className="test-title">Les merveilles de la montagne</h1>
      
      <div className="test-content">
        <div className="test-image-container">
          {imageError ? (
            <div className="image-placeholder">Image non disponible</div>
          ) : (
            <img 
              src={cloudinaryUrl}
              alt="Paysage de montagne"
              className={`test-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
        
        <div className="test-paragraphs">
          <p className="test-paragraph">
            Les montagnes sont parmi les formations géologiques les plus impressionnantes 
            de notre planète. Formées par des mouvements tectoniques sur des millions d'années, 
            elles représentent la puissance brute de la nature et offrent des paysages à couper le souffle.
          </p>
          
          <p className="test-paragraph">
            La randonnée en montagne est une activité qui permet de reconnecter avec la nature 
            dans toute sa splendeur. Chaque pas vous rapproche du ciel, chaque sentier raconte 
            une histoire différente, et chaque sommet atteint est une victoire personnelle qui 
            procure un sentiment incomparable d'accomplissement.
          </p>
          
          <p className="test-paragraph">
            Au-delà de leur beauté visuelle, les montagnes abritent des écosystèmes 
            uniques et fragiles. La flore et la faune qui y vivent se sont adaptées à des 
            conditions climatiques extrêmes et constituent un patrimoine naturel précieux 
            qu'il est essentiel de préserver pour les générations futures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Test;