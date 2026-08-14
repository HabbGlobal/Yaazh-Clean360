const TOKEN_KEY = "yaazh_clean360_token";
const PENDING_EMAIL_KEY = "yaazh_clean360_pending_email";
export const getToken = () => typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const setPendingEmail = (email: string) => sessionStorage.setItem(PENDING_EMAIL_KEY, email);
export const getPendingEmail = () => typeof window === "undefined" ? null : sessionStorage.getItem(PENDING_EMAIL_KEY);
export const clearPendingEmail = () => sessionStorage.removeItem(PENDING_EMAIL_KEY);
