
/**
 * Retrieves the value of an environment variable, with support for various environment variable prefixes.
 *
 * @param {string} environmentVariable - The name of the environment variable to retrieve.
 * @returns {string | null} The value of the environment variable, or `null` if the variable is not found.
 */
const getEnvironmentVariable = (environmentVariable: string): string => {
  /* @ts-ignore Expected warning to access to process */
	const unvalidatedEnvironmentVariable = process.env[environmentVariable];
	/*if (!unvalidatedEnvironmentVariable) {
		throw new Error(
			`Couldn't find environment variable: ${environmentVariable}`,
		);
	} else {
		return unvalidatedEnvironmentVariable;
	}*/
  return unvalidatedEnvironmentVariable || null;
};

export default getEnvironmentVariable;
