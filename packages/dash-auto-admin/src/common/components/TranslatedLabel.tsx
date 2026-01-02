/**
 * TranslatedLabel Component
 * 
 * A component that automatically translates labels using react-admin's i18n system.
 * Useful for rendering translated labels in legends, titles, and other places
 * where raw text is displayed.
 */

import React from 'react';
import { useTranslate } from 'react-admin';
import { isTranslationKey } from '../../hooks/useAutoAdminTranslate';

export interface TranslatedLabelProps {
    /** The label to translate (can be a translation key or plain text) */
    label: string | undefined;
    /** Optional fallback if translation is not found */
    fallback?: string;
    /** Optional className for styling */
    className?: string;
    /** Optional component to wrap the text (default: span) */
    component?: React.ElementType;
    /** Optional props to pass to the wrapper component */
    componentProps?: Record<string, any>;
}

/**
 * Component that renders a translated label
 * If the label looks like a translation key (contains dots), it will be translated
 * Otherwise, it renders the label as-is
 */
export const TranslatedLabel: React.FC<TranslatedLabelProps> = ({
    label,
    fallback = '',
    className,
    component: Component = 'span',
    componentProps = {},
}) => {
    const translate = useTranslate();

    if (!label) {
        return fallback ? <Component className={className} {...componentProps}>{fallback}</Component> : null;
    }

    let displayText = label;

    if (isTranslationKey(label)) {
        const translated = translate(label, { _: label });
        // If translation returns the key itself and we have a fallback, use it
        if (translated === label && fallback) {
            displayText = fallback;
        } else {
            displayText = translated;
        }
    }

    return (
        <Component className={className} {...componentProps}>
            {displayText}
        </Component>
    );
};

/**
 * Higher-order component that provides translation to a component
 */
export const withTranslatedLabel = <P extends { label?: string }>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const translate = useTranslate();
        
        let translatedLabel = props.label;
        if (props.label && isTranslationKey(props.label)) {
            translatedLabel = translate(props.label, { _: props.label });
        }

        return <WrappedComponent {...props} label={translatedLabel} />;
    };
};

export default TranslatedLabel;
