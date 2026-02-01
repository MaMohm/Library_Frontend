import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isTokenValid, clearAuthData } from '../utils/auth';

export interface User {
    id: number;
    email: string;
    name?: string;
    role: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initializeState = (): AuthState => {
    const token = localStorage.getItem('token');
    const isValid = isTokenValid(token);

    if (!isValid) {
        clearAuthData();
        return {
            user: null,
            token: null,
            isAuthenticated: false,
        };
    }

    let user = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error("Failed to parse user from storage", e);
    }

    return {
        user,
        token,
        isAuthenticated: true,
    };
};

const initialState: AuthState = initializeState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            clearAuthData();
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
