const invertMap = (map: any) => {
	if (!map) {
		return false;
	}
	const invertedMap: any = {};
	Object.keys(map).forEach((key) => (invertedMap[map[key]] = key));
	return invertedMap;
};

export default invertMap;
