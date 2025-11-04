interface CookieOptions {
    expires?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
    const defaults: CookieOptions = {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    const opts = { ...defaults, ...options };
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.expires) {
        const date = new Date();
        date.setTime(date.getTime() + opts.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
    }

    if (opts.path) {
        cookieString += `; path=${opts.path}`;
    }

    if (opts.domain) {
        cookieString += `; domain=${opts.domain}`;
    }

    if (opts.secure) {
        cookieString += '; secure';
    }

    if (opts.sameSite) {
        cookieString += `; samesite=${opts.sameSite}`;
    }

    document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
    }

    return null;
}

export function deleteCookie(name: string, path: string = '/'): void {
    setCookie(name, '', { expires: -1, path });
}

export function hasCookie(name: string): boolean {
    return getCookie(name) !== null;
}

export function getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (const cookie of cookieArray) {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name) {
            cookies[decodeURIComponent(name)] = decodeURIComponent(value || '');
        }
    }

    return cookies;
}
