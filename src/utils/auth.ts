export const clearAuthData = () => {
    const authKeys = ['token', 'user', 'refreshToken'];
    authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
};

export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};
