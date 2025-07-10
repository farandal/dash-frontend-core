const getAllCssVariablesFromStyleSheets = (selector: string) => {

        const cssVariables = {};

        // Loop through all style sheets
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const styleSheet = document.styleSheets[i];
                // Skip if the stylesheet is from a different origin and can't be accessed
                if (!styleSheet.cssRules) continue;

                // Loop through all CSS rules in the stylesheet
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    const rule = styleSheet.cssRules[j];

                    // Check if it's a style rule (type 1)

                    /* @ts-ignore */
                    if (rule.selectorText === selector) {

                        /* @ts-ignore */
                        const style = rule.style;

                        // Loop through all style properties
                        for (let k = 0; k < style.length; k++) {
                            const prop = style[k];
                            if (prop.startsWith('--')) {
                                //console.log(prop,style.getPropertyValue(prop).trim());
                                cssVariables[prop] = style.getPropertyValue(prop).trim();
                            }
                        }
                    }

                }
            } catch (e) {
                // Skip cross-origin stylesheets that throw security errors
                console.warn('Could not access stylesheet:', e);
            }
        }


        return cssVariables;
    };


    export default getAllCssVariablesFromStyleSheets;
