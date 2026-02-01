/**
 * Global Configuration for the Frontend Application.
 * Centralizes API URLs and other environment-specific settings.
 */
export const config = {
    // Base API URL - should include /api suffix
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',

    // Base URL for Images/Uploads (without /api)
    API_BASE: (() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        return apiUrl.replace(/\/api\/?$/, '');
    })(),

    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
};
