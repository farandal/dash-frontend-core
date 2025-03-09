import React from 'react';

function isClassComponent(component) {
	return (
		typeof component === 'function' && !!component.prototype.isReactComponent
	);
}

function isFunctionComponent(component) {
	return (
		typeof component === 'function' &&
		String(component).includes('return React.createElement')
	);
}

function isReactComponent(component) {
	return isClassComponent(component) || isFunctionComponent(component);
}

function isElement(element) {
	return React.isValidElement(element);
}

function isDOMTypeElement(element) {
	return isElement(element) && typeof element.type === 'string';
}

function isCompositeTypeElement(element) {
	return isElement(element) && typeof element.type === 'function';
}

export default isReactComponent;

/*const isComponent = (Component) => {
    debugger;
    if (typeof Component === "undefined") return false;
    return !!Component.name
    return (
        typeof Component === 'function' // can be various things
        && !(
            Component.prototype // native arrows don't have prototypes
            && Component.prototype.isReactComponent // special property
        )
    );
}*/
