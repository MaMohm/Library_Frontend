import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import api from '@/services/api/axiosConfig';
import {
    Shield, Users, BookOpen, FolderOpen, Trash2,
    ChevronRight, Activity, TrendingUp, UserPlus
} from 'lucide-react';
import styles from './AdminDashboardPage.module.scss';

interface AdminStats {
    totalUsers: number;
    totalBooks: number;
    totalCategories: number;
    deletedBooks: number;
    recentUsers: Array<{ id: number; email: string; role: string; createdAt: string }>;
}

export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalBooks: 0,
        totalCategories: 0,
        deletedBooks: 0,
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect if not admin
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }

        fetchStats();
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [usersRes, booksRes, categoriesRes] = await Promise.allSettled([
                api.get('/admin/users', config),
                api.get('/books?limit=1', config),
                api.get('/categories', config),
            ]);

            setStats({
                totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data?.length || 0 : 0,
                totalBooks: booksRes.status === 'fulfilled' ? booksRes.value.data?.pagination?.total || 0 : 0,
                totalCategories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.data?.length || 0 : 0,
                deletedBooks: 0,
                recentUsers: usersRes.status === 'fulfilled'
                    ? (usersRes.value.data || []).slice(0, 5)
                    : []
            });
        } catch (error) {
            console.error('Failed to fetch admin stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading admin dashboard...</div>
            </div>
        );
    }

    const quickActions = [
        {
            icon: <Users size={24} color="#3b82f6" />,
            title: 'Manage Users',
            description: 'View, edit, and manage user accounts',
            path: '/admin/users'
        },
        {
            icon: <BookOpen size={24} color="#10b981" />,
            title: 'Manage Books',
            description: 'Add, edit, or remove books from library',
            path: '/admin/books'
        },
        {
            icon: <FolderOpen size={24} color="#f59e0b" />,
            title: 'Manage Categories',
            description: 'Organize books into categories',
            path: '/admin/categories'
        },
        {
            icon: <Trash2 size={24} color="#ef4444" />,
            title: 'Recycle Bin',
            description: 'Restore or permanently delete items',
            path: '/admin/recycle-bin'
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1><Shield size={32} color="#8b5cf6" /> Admin Dashboard</h1>
                <p>Welcome back, {user?.email?.split('@')[0]}. Here's an overview of your library.</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard} onClick={() => navigate('/admin/users')}>
                    <div className={`${styles.iconWrapper} ${styles.blue}`}>
                        <Users size={28} color="#3b82f6" />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.value}>{stats.totalUsers}</span>
                        <span className={styles.label}>Total Users</span>
                    </div>
                </div>

                <div className={styles.statCard} onClick={() => navigate('/admin/books')}>
                    <div className={`${styles.iconWrapper} ${styles.green}`}>
                        <BookOpen size={28} color="#10b981" />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.value}>{stats.totalBooks}</span>
                        <span className={styles.label}>Total Books</span>
                    </div>
                </div>

                <div className={styles.statCard} onClick={() => navigate('/admin/categories')}>
                    <div className={`${styles.iconWrapper} ${styles.orange}`}>
                        <FolderOpen size={28} color="#f59e0b" />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.value}>{stats.totalCategories}</span>
                        <span className={styles.label}>Categories</span>
                    </div>
                </div>

                <div className={styles.statCard} onClick={() => navigate('/admin/recycle-bin')}>
                    <div className={`${styles.iconWrapper} ${styles.red}`}>
                        <Trash2 size={28} color="#ef4444" />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.value}>{stats.deletedBooks}</span>
                        <span className={styles.label}>In Recycle Bin</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <h2><Activity size={20} /> Quick Actions</h2>
                <div className={styles.quickActions}>
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            className={styles.actionCard}
                            onClick={() => navigate(action.path)}
                        >
                            <div className={styles.iconBox}>{action.icon}</div>
                            <div className={styles.actionInfo}>
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                            <ChevronRight size={20} className={styles.arrow} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.section}>
                <h2><TrendingUp size={20} /> Recent Users</h2>
                <div className={styles.recentActivity}>
                    {stats.recentUsers.length > 0 ? (
                        stats.recentUsers.map((user) => (
                            <div key={user.id} className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    <UserPlus size={18} color="#10b981" />
                                </div>
                                <div className={styles.activityText}>
                                    <strong>{user.email}</strong>
                                    <span> joined as {user.role}</span>
                                </div>
                                <span className={styles.activityTime}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            No recent user activity
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
