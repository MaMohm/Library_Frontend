import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { logout } from '@/app/authSlice';
import { Card } from '@/components/common/Card/Card';
import { Button } from '@/components/common/Button/Button';
import { User, Mail, Shield, LogOut, Heart, BookOpen, Edit2, Trash2 } from 'lucide-react';
import styles from './ProfilePage.module.scss';
import { bookApi } from '@/services/api/bookApi';
import { authApi } from '@/services/api/authApi';
import { categoryApi } from '@/services/api/categoryApi';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal/Modal';
import { useTranslation } from 'react-i18next';

// Extracted Component for Review Logic
const ReviewCard = ({ review, onDelete, onUpdate }: { review: any, onDelete: () => void, onUpdate: (c: string, r: number) => Promise<void> }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(review.content);
    const [rating, setRating] = useState(review.rating);
    const { addToast } = useToast();

    const handleSave = async () => {
        try {
            await onUpdate(content, rating);
            setIsEditing(false);
            addToast('Review updated successfully', 'success');
        } catch (error) {
            addToast('Failed to update review', 'error');
        }
    };

    return (
        <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
                <h4>{review.book.title}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    {!isEditing && (
                        <>
                            <button onClick={() => setIsEditing(true)} className={styles.iconBtn}><Edit2 size={14} /></button>
                            <button onClick={onDelete} className={styles.iconBtn}><Trash2 size={14} color="red" /></button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.reviewSubHeader}>
                <span className={styles.categoryTag}>{review.book?.category?.name || 'Uncategorized'}</span>
            </div>

            {isEditing ? (
                <div className={styles.editForm}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.editText}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                            type="number"
                            min="1" max="5"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            style={{ width: '50px' }}
                            className={styles.input}
                        />
                        <Button variant="primary" onClick={handleSave} size="sm">Save</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">Cancel</Button>
                    </div>
                </div>
            ) : (
                <p className={styles.reviewContent}>{review.content}</p>
            )}

            <div className={styles.reviewFooter}>
                <Heart size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{rating}/5</span>
            </div>
        </div>
    );
};

export const ProfilePage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const { addToast } = useToast();
    const { t } = useTranslation();
    const [readingCount, setReadingCount] = useState(0);
    const [favoritesCount, setFavoritesCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const favs = await bookApi.getFavorites();
                setFavoritesCount(favs.length);

                // Fetch reading books
                const reading = await bookApi.getMyLibrary('READING');
                setReadingCount(reading.length);
            } catch (error) {
                console.error('Failed to fetch profile stats');
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        addToast('Logged out successfully', 'info');
        window.location.hash = '#/login';
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return styles.adminBadge;
            case 'MEMBER':
            default:
                return styles.memberBadge;
        }
    };

    // Edit Profile Logic
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPassword, setEditPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Reviews Tab Logic
    const [activeTab, setActiveTab] = useState('reviews');
    const [reviews, setReviews] = useState<any[]>([]);

    // Delete Confirmation Logic
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, bookId: number | null, reviewId: number | null }>({
        isOpen: false, bookId: null, reviewId: null
    });

    // Requests for filtering
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');

    useEffect(() => {
        const fetchReviews = async () => {
            if (activeTab === 'reviews') {
                try {
                    const data = await bookApi.getMyReviews();
                    setReviews(data);
                } catch (error) {
                    console.error('Failed to fetch user reviews');
                }
            }
        };
        fetchReviews();

        // Fetch categories for filter
        const fetchCategories = async () => {
            try {
                const cats = await categoryApi.getAll();
                setCategories(cats);
            } catch (e) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, [activeTab]);

    // Initial sync of editName when user loads
    useEffect(() => {
        if (user?.name) setEditName(user.name);
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await authApi.updateProfile({
                name: editName,
                password: editPassword || undefined
            });
            addToast('Profile updated successfully! Please login again to see changes.', 'success');
            handleLogout();
        } catch (error) {
            addToast('Failed to update profile', 'error');
        } finally {
            setIsUpdating(false);
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteReview = async () => {
        if (deleteModal.bookId && deleteModal.reviewId) {
            try {
                await bookApi.deleteReview(deleteModal.bookId, deleteModal.reviewId);
                setReviews(prev => prev.filter(r => r.id !== deleteModal.reviewId));
                addToast('Review deleted successfully', 'success');
            } catch (error) {
                addToast('Failed to delete review', 'error');
            } finally {
                setDeleteModal({ isOpen: false, bookId: null, reviewId: null });
            }
        }
    };

    // Filter reviews
    const filteredReviews = selectedCategory === 'ALL'
        ? reviews
        : reviews.filter(r => r.book?.category?.id === selectedCategory);

    return (
        <div className={styles.profile}>
            <h1>{t('profile.title')}</h1>

            <Card className={styles.profileCard}>
                <div className={styles.avatar}>
                    <User size={60} />
                </div>
                <div className={styles.info}>
                    <div className={styles.infoItem}>
                        <Mail size={20} />
                        <span>{user?.email || 'user@example.com'}</span>
                    </div>
                    {user?.name && (
                        <div className={styles.infoItem}>
                            <User size={20} />
                            <span>{user.name}</span>
                        </div>
                    )}
                    <div className={styles.infoItem}>
                        <Shield size={20} />
                        <span className={`${styles.roleBadge} ${getRoleBadgeClass(user?.role || 'MEMBER')}`}>
                            {user?.role || 'MEMBER'}
                        </span>
                    </div>
                </div>
            </Card>

            <div className={styles.statsRow}>
                <Card className={styles.statCard} onClick={() => window.location.hash = '#/favorites'} style={{ cursor: 'pointer' }}>
                    <Heart size={24} className={styles.iconRed} />
                    <div>
                        <span className={styles.statValue}>{favoritesCount}</span>
                        <span className={styles.statLabel}>{t('profile.favorites')}</span>
                    </div>
                </Card>
                <Card className={styles.statCard} onClick={() => window.location.hash = '#/dashboard'} style={{ cursor: 'pointer' }}>
                    <BookOpen size={24} className={styles.iconBlue} />
                    <div>
                        <span className={styles.statValue}>{readingCount}</span>
                        <span className={styles.statLabel}>{t('profile.reading')}</span>
                    </div>
                </Card>
            </div>

            <div className={styles.actions}>
                <Button variant="primary" onClick={() => setIsEditModalOpen(true)}>
                    <User size={18} />
                    {t('profile.editProfile')}
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut size={18} />
                    {t('profile.logout')}
                </Button>
            </div>

            {/* Content Section */}
            <div className={styles.contentSection}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        {t('profile.myReviews')} ({reviews.length})
                    </button>
                </div>

                {/* Category Filter */}
                {activeTab === 'reviews' && categories.length > 0 && (
                    <div className={styles.filterContainer}>
                        <button
                            className={`${styles.filterChip} ${selectedCategory === 'ALL' ? styles.activeChip : ''}`}
                            onClick={() => setSelectedCategory('ALL')}
                        >
                            {t('profile.all')}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.filterChip} ${selectedCategory === cat.id ? styles.activeChip : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {t(`profile.${cat.name.toLowerCase()}`, { defaultValue: cat.name })}
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className={styles.reviewList}>
                        {filteredReviews.length > 0 ? (
                            filteredReviews.map((review: any) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onDelete={() => setDeleteModal({ isOpen: true, bookId: review.book.id, reviewId: review.id })}
                                    onUpdate={async (newContent, newRating) => {
                                        await bookApi.updateReview(review.book.id, review.id, newContent, newRating);
                                        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, content: newContent, rating: newRating } : r));
                                    }}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>{t('profile.noReviews')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('profile.editProfile')}>
                <form onSubmit={handleUpdateProfile}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            placeholder="Your Name"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>New Password (optional)</label>
                        <input
                            type="password"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isUpdating}>
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                title="Delete Review"
                size="sm"
            >
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    Are you sure you want to delete this review? This action cannot be undone.
                </p>
                <div className={styles.modalActions}>
                    <Button variant="outline" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</Button>
                    <Button variant="primary" onClick={handleDeleteReview} style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};
