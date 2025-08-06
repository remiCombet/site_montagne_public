import React, { useState, useEffect } from 'react';
import { getResponsiveImageUrls } from '../../utils/imageUtils';

/**
 * Composant d'image responsive qui charge l'image optimale selon la taille d'écran
 */
const ResponsiveImage = ({ 
    src,
    alt = "", 
    className = "", 
    context = "card",
    options = {},
    ...props 
}) => {
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [responsiveUrls, setResponsiveUrls] = useState(null);
    
    // Générer les URLs pour les différentes tailles d'écran
    useEffect(() => {
        const contextualOptions = {
            banner: { crop: 'fill', aspectRatio: '16:9' },
            thumbnail: { crop: 'thumb', gravity: 'faces' },
            card: { crop: 'fill', aspectRatio: '4:3' },
            gallery: { crop: 'scale' }
        }[context] || {};
        
        // Fusionner les options contextuelles avec les options personnalisées
        const mergedOptions = { ...contextualOptions, ...options };
        
        // Récupérer les URLs responsives
        setResponsiveUrls(getResponsiveImageUrls(src, mergedOptions));
        
        // Par défaut, utiliser l'URL mobile
        setCurrentImageUrl(getResponsiveImageUrls(src, mergedOptions).mobile);
    }, [src, context, options]);
    
    // Mettre à jour l'image en fonction de la taille d'écran
    useEffect(() => {
        if (!responsiveUrls) return;
        
        const updateImageSource = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setCurrentImageUrl(responsiveUrls.desktop);
            } else if (width >= 768) {
                setCurrentImageUrl(responsiveUrls.tablet);
            } else {
                setCurrentImageUrl(responsiveUrls.mobile);
            }
        };
        
        // Mettre à jour l'image au chargement et lors du redimensionnement
        updateImageSource();
        window.addEventListener('resize', updateImageSource);
        
        return () => {
            window.removeEventListener('resize', updateImageSource);
        };
    }, [responsiveUrls]);
    
    return (
        <img 
            src={currentImageUrl || src} 
            alt={alt} 
            className={`responsive-image ${className} ${context}-image`} 
            loading="lazy"
            {...props}
        />
    );
};

export default ResponsiveImage;