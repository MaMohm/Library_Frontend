import { useEffect, useState } from 'react';
import { bookApi } from '@/services/api/bookApi';
import { Trash2, RotateCcw, X } from 'lucide-react';
import styles from './RecycleBinPage.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal/Modal';
import { Button } from '@/components/common/Button/Button';

export const RecycleBinPage = () => {
    const [deletedBooks, setDeletedBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, bookId: number | null }>({
        isOpen: false, bookId: null
    });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        loadTrash();
    }, [user, navigate]);

    const loadTrash = async () => {
        try {
            setLoading(true);
            const data = await bookApi.getTrash();
            setDeletedBooks(data);
        } catch (error) {
            console.error('Failed to load trash', error);
            addToast('Failed to load trash items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: number) => {
        try {
            await bookApi.restore(id);
            addToast('Book restored successfully', 'success');
            loadTrash();
        } catch (error) {
            addToast('Failed to restore book', 'error');
        }
    };

    const handlePermanentDelete = async () => {
        if (!deleteModal.bookId) return;

        try {
            await bookApi.permanentDelete(deleteModal.bookId);
            addToast('Book permanently deleted', 'success');
            loadTrash();
        } catch (error) {
            addToast('Failed to delete permanently', 'error');
        } finally {
            setDeleteModal({ isOpen: false, bookId: null });
        }
    };

    if (loading) return <div className={styles.loading}>Loading Trash...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1><Trash2 /> Recycle Bin</h1>
                <p>Manage deleted books. Restore them or delete them permanently.</p>
            </header>

            {deletedBooks.length === 0 ? (
                <div className={styles.emptyState}>
                    <Trash2 size={48} />
                    <h3>Recycle Bin is Empty</h3>
                    <p>No deleted books found.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {deletedBooks.map((book) => (
                        <div key={book.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3>{book.title}</h3>
                                <p className={styles.author}>by {book.author}</p>
                                <div className={styles.meta}>
                                    <span className={styles.date}>Deleted: {new Date(book.deletedAt).toLocaleDateString()}</span>
                                    {book.user && <span className={styles.user}>by {book.user.name}</span>}
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.restoreBtn} onClick={() => handleRestore(book.id)} title="Restore">
                                    <RotateCcw size={20} />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => setDeleteModal({ isOpen: true, bookId: book.id })} title="Permanent Delete">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                title="Permanent Delete"
                size="sm"
            >
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    Are you sure you want to permanently delete this book? This action CANNOT be undone.
                </p>
                <div className={styles.modalActions}>
                    <Button variant="outline" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</Button>
                    <Button variant="primary" onClick={handlePermanentDelete} style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}>Delete Permanently</Button>
                </div>
            </Modal>
        </div>
    );
};
