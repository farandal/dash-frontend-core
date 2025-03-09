
import React, { FC } from 'react';

/**
 * Defines the interface for the DictionaryContext, which provides access to a dictionary of key-value pairs and a set of replacements to be applied to strings.
 *
 * @interface IDictionaryContext
 * @property {{[key: string]: any}} dictionary - An object containing the dictionary of key-value pairs.
 * @property {{[key: string]: any}} replacements - An object containing the replacements to be applied to strings.
 * @property {function(string, boolean?): string} get - A function that retrieves the value for a given key from the dictionary, optionally applying the replacements.
 */
export interface IDictionaryContext {
	dictionary: { [key: string]: any };
	replacements:  { [key: string]: any };
	get: (key: string, replace?:boolean) => string;
}

/**
 * Recursively replaces all occurrences of keys in the provided `dictionary` object with their corresponding values in the given `string`.
 *
 * @param string - The input string to perform the replacements on.
 * @param dictionary - An object containing key-value pairs to use for the replacements.
 * @returns The input string with all replacements made.
 */
function replaceDictValues(string: string, dictionary: { [key: string]: string }): string {
	for (const [key, value] of Object.entries(dictionary)) {
		if (typeof value === 'object' && value !== null) {
			string = replaceDictValues(string, value);
		} else {
			string = Array.isArray(string) ? string.join(', ').replace(key, value) : typeof string === 'string' ? string.replace(key, value) : string;
		}
	}

	return string;
}


/**
 * Provides a context for accessing a dictionary of key-value pairs and a set of replacements to be applied to strings.
 *
 * The `DictionaryContext` exposes an interface with the following properties:
 * - `dictionary`: An object containing the dictionary of key-value pairs.
 * - `replacements`: An object containing the replacements to be applied to strings.
 * - `get`: A function that retrieves the value for a given key from the dictionary, optionally applying the replacements.
 */
export const DictionaryContext = React.createContext<IDictionaryContext>({
	dictionary: null,
	replacements: null,
	get: (key: string/* , replace?:boolean*/) => {
		return key; /*return constants.dict[key] ? constants.dict[key] : key*/
	},
});

/**
 * Provides a `DictionaryContext.Provider` component that wraps child components and provides access to a dictionary of key-value pairs and a set of replacements to be applied to strings.
 *
 * The `DictionaryProvider` component accepts the following props:
 * - `dictionary`: An object containing the dictionary of key-value pairs.
 * - `replacements`: An object containing the replacements to be applied to strings.
 * - `children`: The React nodes to be wrapped by the `DictionaryContext.Provider`.
 *
 * The `DictionaryContext.Provider` exposes the following values:
 * - `dictionary`: The dictionary of key-value pairs.
 * - `replacements`: The replacements to be applied to strings.
 * - `get`: A function that retrieves the value for a given key from the dictionary, optionally applying the replacements.
 *
 * @returns The DictionaryProvider component
 */
const DictionaryProvider: FC<{
	dictionary: { [key: string]: any };
	replacements: { [key: string]: any };
	children: React.ReactNode;
}> = ({ dictionary, replacements, children }) => {
	
	return (
		<DictionaryContext.Provider
			value={{
				dictionary,
				replacements,
				get: (key: string, replace?:boolean) => {
					let str = key;
					if (replace && replacements) {
						str = replaceDictValues(str, replacements);
					}
					return dictionary[str] ? dictionary[str] : str;
				},
			}}
		>
			{children}
		</DictionaryContext.Provider>
	);
};

export { DictionaryContext as default, DictionaryProvider };
