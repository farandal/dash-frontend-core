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

/**
 * Read CSS variables from all stylesheets EXCEPT the dynamic theme style element.
 * This gives us the "static" compiled LESS/CSS defaults, unaffected by our own dynamic overrides.
 */
function getStaticCssVariables(): Record<string, string> {
    const result: Record<string, string> = {};
    for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        const ownerNode = sheet.ownerNode as HTMLElement;
        // Skip our dynamic theme style element to avoid reading back our own values
        if (ownerNode?.id === 'dash-theme-variables') continue;
        try {
            const rules = (sheet as CSSStyleSheet).cssRules;
            if (!rules) continue;
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if ('selectorText' in rule && (rule as CSSStyleRule).selectorText === ':root') {
                    const style = (rule as CSSStyleRule).style;
                    for (let k = 0; k < style.length; k++) {
                        const name = style[k];
                        if (name.startsWith('--')) {
                            result[name] = style.getPropertyValue(name).trim();
                        }
                    }
                }
            }
        } catch {
            continue;
        }
    }
    return result;
}

export const updateDomCssVariables = (
    theme: string,
    colors?: { [x: string]: string },
    values?: { [x: string]: string }
) => {
    const debug = false;
    const themeSuffix = `--${theme}`;
    const logKeys = [
         "primary-color--light",
         "primary-color--dark",
         "primary-contrast--light",
         "primary-contrast--dark",
        // "secondary-color--light",
        // "secondary-color--dark",
        // "highlight-color--light",
        // "highlight-color--dark",
        //"framed_layout-bg--light",
        //"framed_layout-bg--dark",
    ];


    // Find or create the style element
    let themeStyleElement = document.getElementById('dash-theme-variables') as HTMLStyleElement | null;

    if (!themeStyleElement) {
        themeStyleElement = document.createElement('style');
        themeStyleElement.id = 'dash-theme-variables';
    }

    // CRITICAL FIX: Always ensure the style element is at the END of <head>
    // for highest CSS cascade priority. This ensures our dynamic tenant colors
    // override the static compiled LESS/CSS defaults.
    // appendChild on an already-attached element moves it to the new position.
    document.head.appendChild(themeStyleElement);

    let styleString = '';

    values && Object.entries(values).forEach(([key, value]) => {
        styleString += `--${key}: ${value}; `;
    });

    // Always read the compiled static defaults (excluding our dynamic style) as a
    // per-key fallback — even when `colors` is provided. A tenant's saved `colors`
    // object can be PARTIAL (e.g. only --light keys saved, no --dark counterparts).
    // Without this fallback, any key missing from `colors` for the active theme
    // would never be set at all, leaving base vars like --primary-color undefined
    // and breaking anything (e.g. the sidebar gradient) that depends on them.
    const staticVars = getStaticCssVariables();

    // Collect all keys to set: union of the tenant's saved colors AND the static
    // compiled defaults, so nothing is ever silently left unset.
    const allKeys = new Set<string>();
    if (colors) {
        Object.keys(colors).forEach(k => allKeys.add(k));
    }
    Object.keys(staticVars).forEach(name => {
        allKeys.add(name.slice(2)); // remove leading '--'
    });
    logKeys.forEach(k => allKeys.add(k));

    allKeys.forEach(key => {
        // Get value: prefer colors param, then static vars, then computed DOM
        let value = colors?.[key];
        if (!value && staticVars) {
            value = staticVars[`--${key}`];
        }
        if (!value) value = getCssVarFromDom(key);

        if (value) {
            // Write EVERY key we have a value for — including BOTH the --light AND
            // --dark suffixed variants, regardless of the active theme.
            //
            // Previously this only wrote the ACTIVE theme's suffixed keys, which left
            // the OTHER theme's suffixed vars stuck at their static compiled defaults
            // (e.g. while in light mode, --primary-color--dark stayed the app's
            // build-time default instead of the tenant's value). Any code that
            // references a specific theme's variable directly — notably the
            // always-dark sidebar, which reads var(--primary-color--dark) in both
            // modes — needs BOTH variants populated with the tenant values no matter
            // which mode is active. Only the BASE (unsuffixed) key below stays
            // theme-dependent and follows the active mode.
            styleString += `--${key}: ${value}; `;
            if (logKeys.includes(key)) {
                debug && console.log(`%c ⬤ --${key}: ${value}; `, `color: ${value};`);
            }
        }
        
        // Only set baseKey for the current theme
        if (key.endsWith(themeSuffix)) {
            const baseKey = key.slice(0, -themeSuffix.length);
            let baseValue = colors?.[key];
            if (!baseValue && staticVars) {
                baseValue = staticVars[`--${key}`];
            }
            if (!baseValue) baseValue = getCssVarFromDom(key);
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