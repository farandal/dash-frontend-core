const enumToChoices = (e: any) =>
	Object.keys(e).map((key: string) => ({ id: e[key], name: key }));
export default enumToChoices;
