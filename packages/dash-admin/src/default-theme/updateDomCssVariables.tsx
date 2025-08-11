function getCssVarFromDom(key: string): string | undefined {
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--${key}`).trim();
    return value || undefined;
}

function getAllCSSVariableNames(styleSheets: StyleSheetList = document.styleSheets): string[] {
    const cssVars = new Set<string>();

    for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        let rules: CSSRuleList | undefined;

        try {
            // Some stylesheets may be cross-origin and throw on access
            rules = (sheet as CSSStyleSheet).cssRules;
        } catch {
            continue;
        }

        if (!rules) continue;

        for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            // Only process style rules (ignore @media, @font-face, etc.)
            if ('style' in rule && rule.style) {
                const style = rule.style as CSSStyleDeclaration;
                for (let k = 0; k < style.length; k++) {
                    const name = style[k];
                    if (name.startsWith('--')) {
                        cssVars.add(name);
                    }
                }
            }
        }
    }

    return Array.from(cssVars);
}

export const updateDomCssVariables = (
    theme: string,
    colors?: { [x: string]: string },
    values?: { [x: string]: string }
) => {
    const debug = false;
    const themeSuffix = `--${theme}`;
    const logKeys = [
        // "primary-color--light",
        // "primary-color--dark",
         "framed_layout-bg--light",
         "framed_layout-bg--dark",
        // "primary-color--light",
        // "primary-contrast--light",
        // "primary-contrast--dark",
        // "secondary-color--light",
        // "secondary-color--dark",
        // "highlight-color--light",
        // "highlight-color--dark",
        //"framed_layout-bg--light",
        //"framed_layout-bg--dark",
    ];

    // Find the style element by id before creating a new one
    let themeStyleElement = document.getElementById('dash-theme-variables') as HTMLStyleElement | null;

    if (!themeStyleElement) {
        themeStyleElement = document.createElement('style');
        themeStyleElement.id = 'dash-theme-variables';
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

    // Collect all keys to set (from colors or fallback to DOM)
    const allKeys = new Set<string>();
    if (colors) {
        Object.keys(colors).forEach(k => allKeys.add(k));
    } else {
        // Use getAllCSSVariableNames to get all CSS variable names from the DOM
        const cssVarNames = getAllCSSVariableNames();
        cssVarNames.forEach(name => {
            allKeys.add(name.slice(2)); // remove leading '--'
        });
    }
    logKeys.forEach(k => allKeys.add(k));

    allKeys.forEach(key => {
        let value = colors?.[key];
        if (!value) value = getCssVarFromDom(key);
        if (value) {
            // Only add the variable if it doesn't end with a theme suffix OR matches the current theme
            // This prevents variables for other themes from being included
            const isThemeVariable = key.includes('--');
            const isCurrentTheme = key.endsWith(themeSuffix);
            
            // Add all non-theme variables and only the ones for current theme
            if (!isThemeVariable || isCurrentTheme) {
                styleString += `--${key}: ${value}; `;
                if (logKeys.includes(key)) {
                    debug && console.log(`%c ⬤ --${key}: ${value}; `, `color: ${value};`);
                }
            }
        }
        
        // Only set baseKey for the current theme
        if (key.endsWith(themeSuffix)) {
            const baseKey = key.slice(0, -themeSuffix.length);
            let baseValue = colors?.[key] || getCssVarFromDom(key);
            if (baseValue) {
                styleString += `--${baseKey}: ${baseValue}; `;
                if (logKeys.includes(`${baseKey}${themeSuffix}`)) {
                    debug && console.log(`%c ⬤ [DEFAULT][${themeSuffix}] --${baseKey}: ${baseValue}; `, `color: ${baseValue};`);
                }
            }
        }
    });
    // Remove this log or set debug to false in production
    debug && console.log("STYLES", styleString);
    themeStyleElement.textContent = `:root { ${styleString} }`;
};

export default updateDomCssVariables;