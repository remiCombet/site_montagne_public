export const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

// Fonction robuste pour décoder des textes potentiellement encodés plusieurs fois
export const deepDecodeHTML = (html) => {
    if (!html || typeof html !== 'string') return '';
    
    // Cas particuliers connus
    if (html.includes('&amp;amp;')) {
        html = html.replace(/&amp;amp;/g, '&amp;');
    }
    
    if (html.includes('&amp;lt;')) {
        html = html.replace(/&amp;lt;/g, '&lt;');
    }
    
    if (html.includes('&amp;gt;')) {
        html = html.replace(/&amp;gt;/g, '&gt;');
    }
    
    if (html.includes('&amp;#x27;') || html.includes('&amp;#39;')) {
        html = html.replace(/&amp;#x27;/g, "'").replace(/&amp;#39;/g, "'");
    }
    
    let previous = '';
    let current = html;
    let iterations = 0;
    const maxIterations = 5; // Éviter les boucles infinies
    
    // Décode jusqu'à ce que le texte ne change plus, ou max 5 itérations
    while (previous !== current && iterations < maxIterations) {
        previous = current;
        
        const txt = document.createElement('textarea');
        txt.innerHTML = current;
        current = txt.value;
        
        iterations++;
    }
    
    return current;
};