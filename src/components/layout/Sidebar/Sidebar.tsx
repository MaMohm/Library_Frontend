import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, List, Info, BookOpen, X, LogOut, Trash2, User, Shield } from 'lucide-react';
import styles from './Sidebar.module.scss';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { logout } from '@/app/authSlice';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { token, user } = useSelector((state: RootState) => state.auth);

    const menuItems = [
        { icon: Home, label: t('nav.home'), path: '/' },
        { icon: List, label: t('nav.categories'), path: '/categories' },
        ...(token
            ? [
                { icon: BookOpen, label: t('nav.myBooks'), path: '/my-books' },
                ...(user?.role === 'ADMIN' ? [{ icon: Shield, label: 'Admin Dashboard', path: '/admin' }] : []),
                { icon: Trash2, label: t('nav.recycleBin'), path: '/admin/recycle-bin' },
                { icon: User, label: t('nav.profile'), path: '/profile' }
            ]
            : []),
        { icon: Info, label: t('nav.about'), path: '/about' },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        onClose();
    };

    return (
        <>
            <div
                className={clsx(styles.overlay, { [styles.visible]: isOpen })}
                onClick={onClose}
            />
            <aside className={clsx(styles.sidebar, { [styles.open]: isOpen })}>
                <div className={styles.header}>
                    <h2 className={styles.logo}>Library</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map(item => (
                        <button
                            key={item.path}
                            className={clsx(styles.link, {
                                [styles.active]: location.pathname === item.path,
                            })}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}

                    {!token && (
                        <button
                            className={clsx(styles.link, {
                                [styles.active]: location.pathname === '/login',
                            })}
                            onClick={() => handleNavigation('/login')}
                        >
                            <User size={20} />
                            <span>{t('header.login')}</span>
                        </button>
                    )}
                </nav>

                {token && (
                    <div className={styles.footer}>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>{t('header.logout')}</span>
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};
