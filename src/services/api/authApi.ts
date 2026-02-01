import api from './axiosConfig';

interface LoginCredentials {
    email: string;
    password: string;
}

interface BackendAuthResponse {
    accessToken: string;  // Backend returns accessToken
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

interface NormalizedAuthResponse {
    token: string;  // We use 'token' in frontend
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<NormalizedAuthResponse> => {
        try {
            console.log('📤 Login Request:', credentials.email);

            const response = await api.post<BackendAuthResponse>('/auth/login', credentials);

            console.log('📥 Backend Response:', response.data);

            // ✅ Normalize: accessToken -> token
            const normalizedResponse: NormalizedAuthResponse = {
                token: response.data.accessToken,
                user: response.data.user
            };

            console.log('✅ Normalized Response:', normalizedResponse);

            return normalizedResponse;

        } catch (error: any) {
            console.error('❌ Login Error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data
            });
            throw error;
        }
    },

    logout: async () => {
        console.log('🚪 Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    updateProfile: async (data: { name?: string; password?: string }) => {
        const response = await api.put<NormalizedAuthResponse['user']>('/users/profile', data);
        return response.data;
    }
};