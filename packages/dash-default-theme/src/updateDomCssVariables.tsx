
let themeStyleElement: HTMLStyleElement | null = null;

export const updateDomCssVariables = (theme: string, colors?: { [x: string]: string },values?: { [x: string]: string }) => {

    const themeSuffix = `--${theme}`;
    
    if (!themeStyleElement) {
        themeStyleElement = document.createElement('style');
        themeStyleElement.id = 'dash-theme-variables';
        document.head.appendChild(themeStyleElement);
    }
    
    let styleString = '';

    values && Object.entries(values).forEach(([key, value]) => {
        styleString += `--${key}: ${value}; `; 
    });

    colors && Object.entries(colors).forEach(([key, value]) => {
        styleString += `--${key}: ${value}; `;
        if (key.endsWith(themeSuffix)) {
            const baseKey = key.slice(0, -themeSuffix.length);
            styleString += `--${baseKey}: ${value}; `;
        }
        
        
        
    });


    themeStyleElement.textContent = `:root { ${styleString} }`;
};

export default updateDomCssVariables;