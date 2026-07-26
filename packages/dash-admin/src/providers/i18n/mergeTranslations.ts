/**
 * Deep-merge translation message trees.
 *
 * Apps compose their messages as `{ ...dashAdminEs, ...customSpanish }`. That
 * spread is shallow, so any top-level key defined on BOTH sides is replaced
 * wholesale by the app's version - every core key underneath it is silently
 * dropped. Apps worked around this by hand-merging one extra level for
 * `resource`, but that only moved the problem down a level: core's
 * `resource.tenancy.*` is still erased by an app that defines any
 * `resource.tenancy` key of its own.
 *
 * This merges recursively instead, so core can ship translations for a subtree
 * an app also contributes to. App values still win on leaf collisions.
 *
 * Arrays are replaced, not concatenated - a translation array is a complete
 * value (e.g. a list of month names), never something to append to.
 *
 * @example
 *   mergeTranslations(dashAdminEs, customSpanish)
 *   // core:  resource.tenancy.serviceAccounts.label
 *   // app:   resource.tenancy.tenants.label
 *   // -> both survive
 */
export type TranslationMessages = Record<string, any>;

const isPlainObject = (value: unknown): value is TranslationMessages =>
	typeof value === 'object' &&
	value !== null &&
	!Array.isArray(value);

export const mergeTranslations = (
	...sources: (TranslationMessages | undefined | null)[]
): TranslationMessages => {
	const result: TranslationMessages = {};

	for (const source of sources) {
		if (!isPlainObject(source)) continue;

		for (const key of Object.keys(source)) {
			const incoming = source[key];
			const existing = result[key];

			result[key] =
				isPlainObject(existing) && isPlainObject(incoming)
					? mergeTranslations(existing, incoming)
					: incoming;
		}
	}

	return result;
};

export default mergeTranslations;
