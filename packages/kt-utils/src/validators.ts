/**
 * Validators for common data formats
 */

/**
 * Validates Chilean RUT (Rol Único Tributario) format
 * Supports both formats: with dots (12.345.678-9) and without (12345678-9)
 */
export const RutValidator = (value: string): boolean => {
    const hasDot = value.includes('.') ? true : false;
    if (hasDot) {
        return /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/.test(value);
    }

    const dv = (T: number): string | number => {
        let M = 0,
            S = 1;
        for (; T; T = Math.floor(T / 10)) S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
        return S ? S - 1 : 'k';
    };

    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(value)) {
        return false;
    }

    const tmp = value.split('-');
    let digv = tmp[1];
    const rut = parseInt(tmp[0], 10);

    if (digv === 'K') {
        digv = 'k';
    }

    return dv(rut) === digv;
};

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Validates email format
 */
export const EmailValidator = (value: string): boolean => {
    return EMAIL_REGEX.test(value);
};
