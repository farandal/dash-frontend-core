function replaceParams(params: { [key: string]: string }, str: string): string {
  delete params["*"];
  const regex = new RegExp(`{(${Object.keys(params).join("|")})+}`, "g");
  return str.replace(regex, (match, param) => params[param]);
}
export default replaceParams;