const isFC = (Component) => {
	if (typeof Component === 'undefined') return false;
	return !!Component.name;
};

export default isFC;
