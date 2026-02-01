import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import api from '@/services/api/axiosConfig';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Modal } from '@/components/common/Modal/Modal';
import { BookOpen, Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './BookManagementPage.module.scss';

interface Book {
    id: number | string;
    title: string;
    author: string;
    isbn?: string;
    coverImage?: string;
    status?: string;
    publishedYear?: number;
    category?: { name: string };
}

export const BookManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { addToast } = useToast();

    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; bookId: string | number | null }>({
        isOpen: false,
        bookId: null
    });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchBooks();
    }, [user, page, searchQuery]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await api.get(`/books?page=${page}&limit=10&search=${searchQuery}`, config);

            setBooks(response.data.data || []);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to fetch books', error);
            addToast('Failed to load books', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBook = async () => {
        if (!deleteModal.bookId) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/books/${deleteModal.bookId}`, config);
            addToast('Book deleted successfully', 'success');
            setDeleteModal({ isOpen: false, bookId: null });
            fetchBooks();
        } catch (error) {
            console.error('Failed to delete book', error);
            addToast('Failed to delete book', 'error');
        }
    };

    const getCoverUrl = (book: Book) => {
        if (!book.coverImage) return null;
        if (book.coverImage.startsWith('http')) return book.coverImage;
        return `https://library-api.marwandev.com${book.coverImage}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1><BookOpen size={32} color="#10b981" /> Book Management</h1>
                <div className={styles.actions}>
                    <div className={styles.searchWrapper}>
                        <Input
                            placeholder="Search books..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            leftIcon={<Search size={18} />}
                        />
                    </div>
                    <Button variant="primary" onClick={() => addToast('Add Book feature coming soon', 'info')}>
                        <Plus size={18} /> Add Book
                    </Button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Loading books...</div>
                ) : books.length > 0 ? (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>ISBN</th>
                                    <th>Year</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.id}>
                                        <td>
                                            <div className={styles.bookInfo}>
                                                {getCoverUrl(book) ? (
                                                    <img src={getCoverUrl(book)!} alt={book.title} />
                                                ) : (
                                                    <div className={styles.noCover}>📖</div>
                                                )}
                                                <div>
                                                    <div className={styles.bookTitle}>{book.title}</div>
                                                    <div className={styles.bookAuthor}>{book.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{book.isbn || '-'}</td>
                                        <td>{book.publishedYear || '-'}</td>
                                        <td>{book.category?.name || 'Uncategorized'}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[book.status?.toLowerCase() || 'available']}`}>
                                                {book.status || 'Available'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => addToast('Edit feature coming soon', 'info')}
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteModal({ isOpen: true, bookId: book.id })}
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className={styles.pagination}>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span>Page {page} of {totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className={styles.empty}>No books found.</div>
                )}
            </div>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, bookId: null })}
                title="Delete Book"
            >
                <p>Are you sure you want to delete this book? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, bookId: null })}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                        onClick={handleDeleteBook}
                    >
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
