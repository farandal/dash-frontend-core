let themeStyleElement: HTMLStyleElement | null = null;

export const updateDomCssVariables = (theme: string, colors?: { [x: string]: string },values?: { [x: string]: string }) => {

    const debug = false;
    debug && console.log(`%c UPDATING COLORS IN DOM ${colors?.["primary-color--light"]} `,
                    `background: ${colors?.["primary-color--light"]}; padding: 10px; border-radius: 4px; color: white;`
                        );

    const themeSuffix = `--${theme}`;
    
    if (!themeStyleElement) {
        themeStyleElement = document.createElement('style');
        themeStyleElement.id = 'dash-theme-variables';
        // Insert as first child for higher priority
        if (document.head.firstChild) {
            document.head.insertBefore(themeStyleElement, document.head.firstChild);
        } else {
            document.head.appendChild(themeStyleElement);
        }
    }
    
    let styleString = '';

    values && Object.entries(values).forEach(([key, value]) => {
        styleString += `--${key}: ${value}; `; 
    });
    const logKeys = [
        "primary-color--light",
        "primary-contrast--light",
        "secondary-color--light",
        "secondary-color--dark",
        "highlight-color--light",
        "highlight-color--dark",
    ];

    colors && Object.entries(colors).forEach(([key, value]) => {
        styleString += `--${key}: ${value}; `;
        if (logKeys.includes(key)) {
            debug && console.log(`%c ⬤ [DEFAULT] --${key}: ${value}; `, `color: ${value};`);
        }
        if (key.endsWith(themeSuffix)) {
            const baseKey = key.slice(0, -themeSuffix.length);
            styleString += `--${baseKey}: ${value}; `;
            if (logKeys.includes(`${baseKey}${themeSuffix}`)) {
                debug && console.log(`%c ⬤ [${themeSuffix}] --${baseKey}: ${value}; `, `color: ${value};`);
            }
        }
    });


    themeStyleElement.textContent = `:root { ${styleString} }`;
};

export default updateDomCssVariables;