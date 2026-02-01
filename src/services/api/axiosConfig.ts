import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('🌐 API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor to add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        console.log('📤 Request:', config.method?.toUpperCase(), config.url);
        console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'MISSING');

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor for response
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.status, error.config?.url);

        if (error.response?.status === 401) {
            console.warn('⚠️ 401 Unauthorized - Clearing auth data');
            localStorage.removeItem('token'); // Matching key used in Login
            localStorage.removeItem('user');  // Matching key used in Login

            // Redirect to login only if not already there
            if (!window.location.hash.includes('/login')) {
                window.location.href = '/library/#/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
