import { Navigate, Outlet } from 'react-router-dom';
import { isTokenValid, clearAuthData } from '../../../utils/auth';

export const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    if (!isTokenValid(token)) {
        clearAuthData();
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
