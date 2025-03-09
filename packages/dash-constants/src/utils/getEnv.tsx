import getEnvironmentVariable from "./getEnvironmentVariable";

/**
 * Retrieves the value of an environment variable, with support for various environment variable prefixes.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string | null} The value of the environment variable, or `null` if the variable is not found.
 */
const getEnv = (key: string) => {
	/* @ts-ignore Expected access to process */
	const PREFIX = process.env.ENV_PREFIX || process.env.NEXT_PUBLIC_ENV_PREFIX || process.env.VITE_ENV_PREFIX || process.env.REACT_ENV_PREFIX || '';
	//console.log('GET ENV',PREFIX, key);

  if (PREFIX === 'NEXT_PUBLIC_') {
		return getEnvironmentVariable(PREFIX + key);
	}
	/* @ts-ignore Expected access to process */
	return process.env[PREFIX + key] || null;
};

export default getEnv;
