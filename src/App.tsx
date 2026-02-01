import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { MainLayout } from './components/layout/MainLayout/MainLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { BookListPage } from './pages/Books/BookListPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { ReviewsPage } from './pages/Reviews/ReviewsPage';
import { RecycleBinPage } from './pages/Admin/RecycleBinPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { UserManagementPage } from './pages/Admin/Users/UserManagementPage';
import { BookManagementPage } from './pages/Admin/Books/BookManagementPage';
import { CategoryManagementPage } from './pages/Admin/Categories/CategoryManagementPage';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute/ProtectedRoute';

function App() {
    // Multi-tab sync: Logout if token removed in another tab
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' && !e.newValue) {
                window.location.href = '/library/#/login';
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<MainLayout />}>
                {/* Smart Home Redirect */}
                <Route index element={<HomeRedirect />} />

                {/* Public Routes */}
                <Route path="books" element={<BookListPage />} />
                <Route path="categories" element={<CategoriesPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="favorites" element={<BookListPage filter="favorites" />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="reviews/:id" element={<ReviewsPage />} />

                    {/* Admin Routes */}
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="admin/users" element={<UserManagementPage />} />
                    <Route path="admin/books" element={<BookManagementPage />} />
                    <Route path="admin/categories" element={<CategoryManagementPage />} />
                    <Route path="admin/recycle-bin" element={<RecycleBinPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

// Helper component for smart redirect
const HomeRedirect = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/books" replace />;
};

export default App;
