import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import styles from './BookListPage.module.scss';
import { Card } from '@/components/common/Card/Card';
import { Plus, Heart, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { bookApi } from '@/services/api/bookApi';
import { Book } from '@/types/book.types';
import { AddBookModal } from '@/components/AddBookModal/AddBookModal';
import { BookDetailsModal } from '@/components/BookDetailsModal/BookDetailsModal';
import { config } from '@/config';

interface BookListPageProps {
    filter?: 'favorites';
}

export const BookListPage: React.FC<BookListPageProps> = ({ filter }) => {
    const [allBooks, setAllBooks] = useState<Book[]>([]);
    const [page, setPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [showAddModal, setShowAddModal] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);
    const navigate = useNavigate();
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

    const fetchBooks = async (reset = false) => {
        try {
            if (reset) {
                setInitialLoading(true);
            } else {
                setLoadingMore(true);
            }

            const currentPage = reset ? 1 : page;

            let data: Book[] = [];
            let isLastPage = false;

            if (filter === 'favorites') {
                if (!token) return; // Should be handled by render
                // For favorites, we load ALL of them at once (no pagination yet in backend for this modal)
                // Assuming reasonable number of favorites
                if (page === 1) { // Only fetch on first page load/reset
                    const favBooks = await bookApi.getFavoriteBooks();
                    data = favBooks;
                    isLastPage = true; // No more pages for favorites
                } else {
                    // If somehow asking for page > 1, return empty as we loaded all
                    data = [];
                    isLastPage = true;
                }
            } else {
                const response = await bookApi.getAll(currentPage, 20, search, categoryId);
                data = response.data;
                isLastPage = response.data.length < 20;
            }

            if (reset) {
                setAllBooks(data);
                setPage(1);
            } else {
                setAllBooks(prev => {
                    const existingIds = new Set(prev.map(b => b.id));
                    const newBooks = data.filter(b => !existingIds.has(b.id));
                    return [...prev, ...newBooks];
                });
            }

            setHasMore(!isLastPage);
        } catch (error) {
            console.error('Failed to fetch books', error);
        } finally {
            setInitialLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    // Effect to trigger fetch when page changes (only for load more)
    useEffect(() => {
        if (page > 1) {
            fetchBooks(false);
        }
    }, [page]);

    useEffect(() => {
        // Sync with URL param
        const urlSearch = searchParams.get('search') || '';
        if (urlSearch !== search) setSearch(urlSearch);

        const urlCat = searchParams.get('category');
        setCategoryId(urlCat ? Number(urlCat) : undefined);
    }, [searchParams]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBooks(true); // Reset to page 1
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, categoryId]); // Trigger when categoryId changes

    const getImageUrl = (book: Book) => {
        if (!book.coverImage) return null;
        if (book.coverImage.startsWith('http')) return book.coverImage;
        return `${config.API_BASE}${book.coverImage}`;
    };

    const { token } = useSelector((state: RootState) => state.auth);

    const fetchFavorites = async () => {
        if (!token) return; // Don't fetch if guest
        try {
            const favIds = await bookApi.getFavorites();
            setFavorites(favIds);
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchFavorites();
        }
    }, [token]);

    const toggleFavorite = async (bookId: number) => {
        try {
            // Optimistic update
            const isFav = favorites.includes(bookId);
            setFavorites(prev => isFav ? prev.filter(id => id !== bookId) : [...prev, bookId]);

            await bookApi.toggleFavorite(bookId);
        } catch (error) {
            console.error('Failed to toggle favorite', error);
            // Revert on error
            fetchFavorites();
        }
    };

    const isFavorite = (bookId: number) => favorites.includes(bookId);

    const books = allBooks;

    const getTitle = () => {
        if (filter === 'favorites') return '❤️ My Favorites';
        if (categoryId) return '📂 Category Books';
        return '📚 My Books';
    };

    // Guest View for Favorites
    if (filter === 'favorites' && !token) {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <h1 className={styles.title}>❤️ My Favorites</h1>
                </div>
                <div className={styles.empty}>
                    <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h2>Login Required</h2>
                    <p>Please login to view and manage your favorite books.</p>
                    <Button onClick={() => navigate('/login')} style={{ marginTop: '1rem' }}>
                        Login Now
                    </Button>
                </div>
            </div>
        );
    }

    const [suggestions, setSuggestions] = useState<Book[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = React.useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Smart Search Handler
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (value.trim().length > 0) {
            try {
                // Quick fetch for suggestions (limit 5)
                const response = await bookApi.getAll(1, 5, value);
                setSuggestions(response.data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to fetch suggestions', error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (book: Book) => {
        setSelectedBook(book);
        setShowSuggestions(false);
        setSearch(''); // Optional: clear search after selection or keep it
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{getTitle()}</h1>
                    <p className={styles.subtitle}>
                        {filter === 'favorites' ? 'Your curated collection' : 'Manage your collection'}
                    </p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Add Book
                </Button>
            </div>

            {/* Smart Search Bar */}
            <div className={styles.filters}>
                <div className={styles.searchContainer} ref={searchRef}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search title, author, isbn..."
                            className={styles.searchInput}
                            value={search}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (search.trim().length > 0) setShowSuggestions(true);
                            }}
                        />
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className={styles.suggestionsDropdown}>
                            {suggestions.map(book => (
                                <div
                                    key={book.id}
                                    className={styles.suggestionItem}
                                    onClick={() => handleSuggestionClick(book)}
                                >
                                    {book.coverImage ? (
                                        <img
                                            src={getImageUrl(book) || ''}
                                            alt=""
                                            className={styles.suggestionCover}
                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                        />
                                    ) : (
                                        <div className={styles.suggestionPlaceholder}><BookOpen size={14} /></div>
                                    )}
                                    <div className={styles.suggestionInfo}>
                                        <span className={styles.suggestionTitle}>{book.title}</span>
                                        <span className={styles.suggestionAuthor}>{book.author}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Books Grid */}
            {initialLoading ? (
                <div className={styles.loading}>Loading books...</div>
            ) : (
                <div className={styles.grid}>
                    {books.length === 0 ? (
                        <div className={styles.empty}>No books found</div>
                    ) : (
                        books.map(book => (
                            <Card
                                key={book.id}
                                className={styles.bookCard}
                                variant="elevated"
                                onClick={() => setSelectedBook(book)}
                            >
                                <div className={styles.cover}>
                                    {book.coverImage ? (
                                        <img
                                            src={getImageUrl(book) || ''}
                                            alt={book.title}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://placehold.co/200x300/e8e8e8/999?text=${encodeURIComponent(book.title.slice(0, 15))}`;
                                            }}
                                        />
                                    ) : (
                                        <div className={styles.noCover}>
                                            <BookOpen size={40} />
                                        </div>
                                    )}
                                    {/* Favorite button - Only for logged in users */}
                                    {token && (
                                        <button
                                            className={`${styles.favoriteBtn} ${isFavorite(book.id) ? styles.active : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(book.id);
                                            }}
                                        >
                                            <Heart size={18} fill={isFavorite(book.id) ? '#ef4444' : 'none'} />
                                        </button>
                                    )}
                                    {/* Status badge */}
                                    {book.status && book.status !== 'AVAILABLE' && (
                                        <span className={`${styles.statusBadge} ${styles[book.status.toLowerCase()]}`}>
                                            {book.status}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.info}>
                                    <h3>{book.title}</h3>
                                    <p>{book.author}</p>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Load More */}
            {hasMore && !initialLoading && books.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                    <Button onClick={handleLoadMore} disabled={loadingMore}>
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchBooks}
            />

            {/* Book Details Modal */}
            {selectedBook && (
                <BookDetailsModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onNext={() => {
                        const idx = books.findIndex(b => b.id === selectedBook.id);
                        if (idx !== -1 && idx < books.length - 1) {
                            setSelectedBook(books[idx + 1]);
                        }
                    }}
                    onPrev={() => {
                        const idx = books.findIndex(b => b.id === selectedBook.id);
                        if (idx > 0) {
                            setSelectedBook(books[idx - 1]);
                        }
                    }}
                    hasNext={books.findIndex(b => b.id === selectedBook.id) < books.length - 1}
                    hasPrev={books.findIndex(b => b.id === selectedBook.id) > 0}
                />
            )}
        </div>
    );
};
