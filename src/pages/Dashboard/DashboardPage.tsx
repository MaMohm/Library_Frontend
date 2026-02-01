import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Card } from '@/components/common/Card/Card';
import { BookOpen, Users, Heart, TrendingUp, Library, Star, Trash2 } from 'lucide-react';
import styles from './DashboardPage.module.scss';
import api from '@/services/api/axiosConfig';
import { BookDetailsModal } from '@/components/BookDetailsModal/BookDetailsModal';
import { useTranslation } from 'react-i18next';

interface DashboardStats {
    totalBooks: number;
    totalCategories: number;
    totalFavorites: number;
    recentBooks: Array<{ id: number; title: string; author: string; coverImage?: string }>;
    topRated: Array<{ id: number; title: string; author: string; coverImage?: string }>;
    myLibrary: Array<{ id: number; title: string; author: string; coverImage?: string }>;
    mostRead: Array<{ id: number; title: string; author: string; coverImage?: string }>;
}

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { t } = useTranslation();
    const [stats, setStats] = useState<DashboardStats>({
        totalBooks: 0,
        totalCategories: 0,
        totalFavorites: 0,
        recentBooks: [],
        topRated: [],
        myLibrary: [],
        mostRead: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<{ id: number; title: string; author: string; coverImage?: string } | null>(null);

    const handleBookClick = (book: any) => {
        setSelectedBook(book);
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Explicitly attach token to ensure it's sent
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [booksRes, favoritesRes, categoriesRes, topRatedRes, myLibRes, mostReadRes] = await Promise.all([
                api.get('/books?limit=6', config),
                api.get('/favorites', config),
                api.get('/categories', config),
                api.get('/books?sort=-rating&limit=5', config),
                api.get('/my-library?status=READING', config),
                api.get('/books?sort=most_read&limit=5', config)
            ]);

            setStats({
                totalBooks: booksRes.data.total || booksRes.data.data?.length || 0,
                totalCategories: categoriesRes.data.length || 0,
                totalFavorites: favoritesRes.data.length || 0,
                recentBooks: booksRes.data.data?.slice(0, 6) || [],
                topRated: topRatedRes.data.data || [],
                myLibrary: myLibRes.data || [],
                mostRead: mostReadRes.data.data || []
            });
        } catch (err: any) {
            console.error('Failed to fetch stats', err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchStats();
    }, [token, navigate]);

    if (loading) {
        return <div className={styles.dashboard}><div className={styles.loading}>Loading dashboard...</div></div>;
    }

    if (error) {
        return (
            <div className={styles.dashboard}>
                <Card>
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                        <p>{error}</p>
                        <button onClick={() => navigate('/login')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                            Back to Login
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>{t('home.welcomeBack', { name: user?.email?.split('@')[0] || 'Reader' })} 📚</h1>
                    <p>{t('home.subtitle')}</p>
                </div>
                <div className={styles.heroImage}>
                    <Library size={120} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <Card
                    className={styles.statCard}
                    onClick={() => navigate('/books')}
                    style={{ cursor: 'pointer' }}
                >
                    <BookOpen size={32} className={styles.iconBlue} />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalBooks}</span>
                        <span className={styles.statLabel}>{t('home.totalBooks')}</span>
                    </div>
                </Card>
                <Card
                    className={styles.statCard}
                    onClick={() => navigate('/categories')}
                    style={{ cursor: 'pointer' }}
                >
                    <TrendingUp size={32} className={styles.iconGreen} />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalCategories}</span>
                        <span className={styles.statLabel}>{t('categories.title')}</span>
                    </div>
                </Card>
                <Card
                    className={styles.statCard}
                    onClick={() => navigate('/favorites')}
                    style={{ cursor: 'pointer' }}
                >
                    <Heart size={32} className={styles.iconRed} />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalFavorites}</span>
                        <span className={styles.statLabel}>{t('home.favorites')}</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <Users size={32} className={styles.iconPurple} />
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{user?.role || 'MEMBER'}</span>
                        <span className={styles.statLabel}>{t('home.yourRole')}</span>
                    </div>
                </Card>
                {user?.role === 'ADMIN' && (
                    <Card
                        className={styles.statCard}
                        onClick={() => navigate('/admin/recycle-bin')}
                        style={{ cursor: 'pointer', border: '1px dashed #ef4444' }}
                    >
                        <Trash2 size={32} color="#ef4444" />
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{t('home.bin')}</span>
                            <span className={styles.statLabel}>{t('home.manageTrash')}</span>
                        </div>
                    </Card>
                )}
            </div>

            {/* Recent Books */}
            <div className={styles.section}>
                <h2><Star size={24} /> {t('home.recentAdditions')}</h2>
                <div className={styles.booksGrid}>
                    {stats.recentBooks.length > 0 ? (
                        stats.recentBooks.map(book => (
                            <Card key={book.id} className={styles.bookCard} onClick={() => handleBookClick(book)}>
                                <div className={styles.bookCover}>
                                    {book.coverImage ? (
                                        <img
                                            src={book.coverImage.startsWith('http') ? book.coverImage : `https://library-api.marwandev.com${book.coverImage}`}
                                            alt={book.title}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://placehold.co/120x180/e0e0e0/666?text=${encodeURIComponent(book.title.slice(0, 10))}`;
                                            }}
                                        />
                                    ) : (
                                        <div className={styles.noCover}>📖</div>
                                    )}
                                </div>
                                <div className={styles.bookInfo}>
                                    <h4>{book.title}</h4>
                                    <p>{book.author}</p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p>No books yet</p>
                    )}
                </div>
            </div>

            {/* My Library (Currently Reading) */}
            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h2><BookOpen size={24} color="#3b82f6" /> My Library (Reading Now)</h2>
                <div className={styles.booksGrid}>
                    {stats.myLibrary?.length > 0 ? (
                        stats.myLibrary.map(book => (
                            <Card key={book.id} className={styles.bookCard} onClick={() => handleBookClick(book)}>
                                <div className={styles.bookCover}>
                                    {book.coverImage ? (
                                        <img
                                            src={book.coverImage.startsWith('http') ? book.coverImage : `https://library-api.marwandev.com${book.coverImage}`}
                                            alt={book.title}
                                        />
                                    ) : (
                                        <div className={styles.noCover}>📖</div>
                                    )}
                                </div>
                                <div className={styles.bookInfo}>
                                    <h4>{book.title}</h4>
                                    <p style={{ color: '#3b82f6', fontSize: '0.8rem' }}>Currently Reading</p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p style={{ color: '#888' }}>You are not reading any books currently.</p>
                    )}
                </div>
            </div>

            {/* Top Rated Section */}
            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h2><Heart size={24} fill="red" color="red" /> Reviewer Favorites (Top Rated)</h2>
                <div className={styles.booksGrid}>
                    {stats.topRated?.length > 0 ? (
                        stats.topRated.map(book => (
                            <Card key={book.id} className={styles.bookCard} onClick={() => handleBookClick(book)}>
                                <div className={styles.bookCover}>
                                    {/* Reusing simple cover logic for now */}
                                    {book.coverImage ? (
                                        <img
                                            src={book.coverImage.startsWith('http') ? book.coverImage : `https://library-api.marwandev.com${book.coverImage}`}
                                            alt={book.title}
                                        />
                                    ) : (
                                        <div className={styles.noCover}>⭐</div>
                                    )}
                                </div>
                                <div className={styles.bookInfo}>
                                    <h4>{book.title}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#f59e0b' }}>
                                        <Star size={14} fill="#f59e0b" />
                                        <span>{(book as any).averageRating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p style={{ color: '#888' }}>Not enough ratings yet.</p>
                    )}
                </div>
            </div>

            {/* Most Read (Popular) Section */}
            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h2><TrendingUp size={24} color="#10b981" /> Most Read Books</h2>
                <div className={styles.booksGrid}>
                    {stats.mostRead?.length > 0 ? (
                        stats.mostRead.map(book => (
                            <Card key={book.id} className={styles.bookCard} onClick={() => handleBookClick(book)}>
                                <div className={styles.bookCover}>
                                    {book.coverImage ? (
                                        <img
                                            src={book.coverImage.startsWith('http') ? book.coverImage : `https://library-api.marwandev.com${book.coverImage}`}
                                            alt={book.title}
                                        />
                                    ) : (
                                        <div className={styles.noCover}>🔥</div>
                                    )}
                                </div>
                                <div className={styles.bookInfo}>
                                    <h4>{book.title}</h4>
                                    <p style={{ color: '#10b981', fontSize: '0.8rem' }}>Trending Now</p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p style={{ color: '#888' }}>Check back later for trending books.</p>
                    )}
                </div>
            </div>

            <div style={{ height: '40px' }}></div>

            {selectedBook && (
                <BookDetailsModal
                    book={selectedBook as any}
                    onClose={() => {
                        setSelectedBook(null);
                        fetchStats();
                    }}
                />
            )}
        </div>
    );
};
