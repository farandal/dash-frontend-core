const isEnum = (type: any) =>
	typeof type === 'object' && !(type.attribute && type.type);
export default isEnum;
