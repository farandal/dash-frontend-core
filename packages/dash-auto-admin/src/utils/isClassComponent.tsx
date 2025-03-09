const isClassComponent = (Component) => {
	return !!(
		typeof Component === 'function' &&
		Component.prototype &&
		Component.prototype.isReactComponent
	);
};

export default isClassComponent;
