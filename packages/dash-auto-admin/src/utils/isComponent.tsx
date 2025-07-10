import React from 'react';

export function isClassComponent(component) {
  return (
    typeof component === 'function' && !!component.prototype.isReactComponent
  );
}

export function isFunctionComponent(component) {
  return (
    typeof component === 'function' &&
    String(component).includes('return React.createElement')
  );
}

export function isReactComponent(component) {
  return isClassComponent(component) || isFunctionComponent(component);
}

export function isElement(element) {
  return React.isValidElement(element);
}

export function isDOMTypeElement(element) {
  return isElement(element) && typeof element.type === 'string';
}

export function isCompositeTypeElement(element) {
  return isElement(element) && typeof element.type === 'function';
}

export default isReactComponent;

/*const isComponent = (Component) => {
    
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
