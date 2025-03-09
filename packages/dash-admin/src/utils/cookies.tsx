import cookie from 'js-cookie';

export const setCookie = (
	key: string,
	value: string,
	options: cookie.CookieAttributes = {},
) => {
	//if (process.browser) {
	cookie.set(key, value, {
		/*expires: expires,
            path: '/',
            domain: '*'*/
		path: '/',
		...options,
	});
	//}
};

export const removeCookie = (key) => {
	//if (process.browser) {
	cookie.remove(key, {
		expires: 1,
	});
	//}
};

export const getCookie = (key) => {
	return getCookieFromBrowser(key);
};

const getCookieFromBrowser = (key) => {
	return cookie.get(key);
};
