import cookie from 'js-cookie';

export const setCookie = (
    key: string,
    value: string,
    options: cookie.CookieAttributes = {},
) => {
    cookie.set(key, value, {
        path: '/',
        ...options,
    });
};

export const removeCookie = (key) => {
    cookie.remove(key, {
        expires: 1,
    });
};

export const getCookie = (key) => {
    return getCookieFromBrowser(key);
};

const getCookieFromBrowser = (key) => {
    return cookie.get(key);
};

export const clearAllCookies = () => {
    const allCookies = cookie.get();
    Object.keys(allCookies).forEach((key) => {
        cookie.remove(key, { path: '/' });
    });
};
