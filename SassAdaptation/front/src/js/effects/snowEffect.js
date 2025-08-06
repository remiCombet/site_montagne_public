/**
 * Crée un effet de neige qui peut être appliqué à n'importe quel conteneur
 */
export const createSnowEffect = (containerSelector = '.snow-container', flakeCount = 20) => {
  // Réduire le nombre de flocons par défaut (15 au lieu de 30)
  
  // Détection de performance
  const isLowPowerDevice = () => {
    return window.navigator.deviceMemory < 4 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // Réduire encore plus sur les appareils peu puissants
  const actualFlakeCount = isLowPowerDevice() ? Math.min(flakeCount, 8) : flakeCount;
  
  // Créer moins de flocons sur les écrans plus petits
  const screenWidth = window.innerWidth;
  const adjustedCount = screenWidth < 768 ? Math.floor(actualFlakeCount / 2) : actualFlakeCount;

  const container = document.querySelector(containerSelector);
  
  // S'assurer que le conteneur existe
  if (!container) {
    console.warn(`Le conteneur ${containerSelector} n'existe pas.`);
    return;
  }
  
  // Créer les flocons de neige
  for (let i = 0; i < adjustedCount; i++) {
    const snowflake = document.createElement('div');
    
    // Varier la taille des flocons
    const sizeClass = Math.random() < 0.3 ? 'snowflake--tiny' : 
                      Math.random() > 0.7 ? 'snowflake--large' : '';
    
    snowflake.className = `snowflake ${sizeClass}`;
    
    // Position horizontale aléatoire
    snowflake.style.left = `${Math.random() * 100}%`;
    
    // Délai de départ aléatoire
    snowflake.style.animationDelay = `${Math.random() * 5}s`;
    
    // Durée d'animation aléatoire (entre 5 et 10 secondes)
    snowflake.style.animationDuration = `${5 + Math.random() * 5}s`;
    
    container.appendChild(snowflake);
  }
};

// Vérifier si nous sommes en hiver (pour l'activer conditionnellement)
export const isWinterSeason = () => {
  const month = new Date().getMonth();
  // Actif en décembre (11), janvier (0) et février (1)
  return month === 11 || month === 0 || month === 4;
};