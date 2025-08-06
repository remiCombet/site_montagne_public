import React from 'react';
import { getContextualImageUrl } from '../../utils/imageUtils';

const Banner = ({ imageUrl, title, subtitle }) => {
    // Utiliser des media queries CSS pour charger la bonne image
    const style = {
        '--banner-img-mobile': `url("${getContextualImageUrl(imageUrl, 'banner', 'mobile')}")`,
        '--banner-img-tablet': `url("${getContextualImageUrl(imageUrl, 'banner', 'tablet')}")`,
        '--banner-img-desktop': `url("${getContextualImageUrl(imageUrl, 'banner', 'desktop')}")`
    };
    
    return (
        <div className="banner" style={style}>
            <div className="banner__content">
                {title && <h1 className="banner__title">{title}</h1>}
                {subtitle && <p className="banner__subtitle">{subtitle}</p>}
            </div>
        </div>
    );
};

export default Banner;