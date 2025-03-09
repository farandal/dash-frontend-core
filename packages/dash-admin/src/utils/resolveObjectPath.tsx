const resolveObjectPath = (object, path, defaultValue) =>
	path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object);

export default resolveObjectPath;
