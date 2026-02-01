export interface User {
    id: number;
    email: string;
    name?: string;
    role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER' | 'GUEST';
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
}
