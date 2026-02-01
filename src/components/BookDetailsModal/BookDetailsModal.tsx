import React from 'react';
import { X, Calendar, User, Tag, BookOpen, Hash, ChevronLeft, ChevronRight, Star, PenLine, Check, Library, Book as BookIcon, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Book as BookType } from '@/types/book.types';
import { Button } from '@/components/common/Button/Button';
import styles from './BookDetailsModal.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { bookApi } from '@/services/api/bookApi';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal/Modal';
import { useTranslation } from 'react-i18next';

interface BookDetailsModalProps {
    book: BookType | null;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
    book,
    onClose,
    onNext,
    onPrev,
    hasNext,
    hasPrev
}) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const { addToast } = useToast();
    const { t } = useTranslation();

    // Check if book is already favorited (simple check based on loaded book data, could be improved with fresh fetch)
    const [isFavorite, setIsFavorite] = React.useState(false);

    // Review State
    const [userRating, setUserRating] = React.useState(0);
    const [isReviewing, setIsReviewing] = React.useState(false);
    const [reviewText, setReviewText] = React.useState('');

    // Reading Status State
    const [readingStatus, setReadingStatus] = React.useState<string | null>(null);

    // Fetch status when book opens
    React.useEffect(() => {
        if (book && token) {
            bookApi.getReadingStatus(book.id).then(res => setReadingStatus(res.status)).catch(console.error);
        } else {
            setReadingStatus(null);
        }
    }, [book, token]);

    // Auth Prompt State
    const [showAuthPrompt, setShowAuthPrompt] = React.useState(false);

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const navigate = useNavigate();

    const handleAuthCheck = () => {
        if (!token) {
            setShowAuthPrompt(true);
            return false;
        }
        return true;
    };

    const handleLoginRedirect = () => {
        setShowAuthPrompt(false); // Close auth prompt
        onClose(); // Close main modal
        navigate('/login');
    };

    const getImageUrl = (book: BookType) => {
        if (!book?.coverImage) return null;
        if (book.coverImage.startsWith('http')) return book.coverImage;
        return `https://library-api.marwandev.com${book.coverImage}`;
    };

    const handleToggleFavorite = async () => {
        if (!handleAuthCheck()) return;
        if (!book) return;
        try {
            await bookApi.toggleFavorite(book.id);
            setIsFavorite(!isFavorite);
            addToast(isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
        } catch (error) {
            console.error('Failed to toggle favorite', error);
            addToast('Failed to toggle favorite', 'error');
        }
    };

    const handleStatusChange = async (status: 'READ' | 'READING' | 'PLAN_TO_READ') => {
        if (!handleAuthCheck()) return;
        if (!book) return;
        try {
            await bookApi.updateReadingStatus(book.id, status);
            setReadingStatus(status);
            addToast('Reading status updated', 'success');
        } catch (error) {
            console.error('Failed to update status', error);
            addToast('Failed to update status', 'error');
        }
    };

    const handleSubmitReview = async () => {
        if (!handleAuthCheck()) return;
        if (!book || userRating === 0) {
            addToast('Please select a rating!', 'warning');
            return;
        }
        try {
            await bookApi.addReview(book.id, userRating, reviewText);
            addToast('Review submitted successfully!', 'success');
            setIsReviewing(false);
            setReviewText('');
        } catch (error: any) {
            console.error('Failed to submit review', error);
            const msg = error.response?.data?.message || 'Failed to submit review';
            addToast(msg, 'error');
        }
    };

    const handleDeleteBook = async () => {
        if (!book) return;
        try {
            await bookApi.delete(book.id);
            addToast('Book deleted successfully', 'success');
            setShowDeleteModal(false);
            onClose();
            window.location.reload(); // Simple refresh to update list
        } catch (e) {
            addToast('Failed to delete book', 'error');
            setShowDeleteModal(false);
        }
    };


    // Memoized close handler for robust closing behavior
    const handleClose = React.useCallback((e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setShowAuthPrompt(false);
        onClose();
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={handleClose}>
            {/* Navigation Buttons */}
            {hasPrev && (
                <button
                    className={`${styles.navBtn} ${styles.prev}`}
                    onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                    aria-label="Previous Book"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {hasNext && (
                <button
                    className={`${styles.navBtn} ${styles.next}`}
                    onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                    aria-label="Next Book"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Close Button - Main Click Handler */}
            <button
                type="button"
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Close"
            >
                <X size={24} />
            </button>

            {/* Main Modal Content */}
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.content}>
                    {/* Left Side: Cover & Interactions */}
                    <div className={styles.coverSection}>
                        <div className={styles.coverWrapper}>
                            {book?.coverImage ? (
                                <img
                                    src={getImageUrl(book) || ''}
                                    alt={book?.title}
                                    className={styles.coverImage}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={styles.noCover} hidden={!!book?.coverImage}>
                                <BookIcon size={48} />
                            </div>
                        </div>

                        {/* User Interaction Widget */}
                        <div className={styles.interactionWidget}>
                            <h4 className={styles.qTitle}>{t('bookDetails.haveYouRead')}</h4>

                            <div className={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={24}
                                        className={styles.starIcon}
                                        fill={star <= userRating ? "#f59e0b" : "none"}
                                        color={star <= userRating ? "#f59e0b" : "#d1d5db"} // Outline color
                                        onClick={() => setUserRating(star)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </div>

                            {!isReviewing ? (
                                <button className={styles.reviewBtn} onClick={() => setIsReviewing(true)}>
                                    <PenLine size={18} />
                                    <span>{t('bookDetails.writeReview')}</span>
                                </button>
                            ) : (
                                <div className={styles.reviewForm}>
                                    <textarea
                                        placeholder={t('bookDetails.writeReview')}
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className={styles.reviewInput}
                                    />
                                    <div className={styles.formActions}>
                                        <button onClick={() => setIsReviewing(false)} className={styles.cancelBtn}>{t('bookDetails.cancel')}</button>
                                        <button onClick={handleSubmitReview} className={styles.submitBtn}>{t('bookDetails.submit')}</button>
                                    </div>
                                </div>
                            )}

                            <div className={styles.statusGrid}>
                                <button
                                    className={`${styles.statusBtn} ${readingStatus === 'READ' ? styles.active : ''}`}
                                    onClick={() => handleStatusChange('READ')}
                                >
                                    <Check size={20} />
                                    <span>{t('bookDetails.read')}</span>
                                </button>
                                <button
                                    className={`${styles.statusBtn} ${readingStatus === 'READING' ? styles.active : ''}`}
                                    onClick={() => handleStatusChange('READING')}
                                >
                                    <BookOpen size={20} />
                                    <span>{t('bookDetails.reading')}</span>
                                </button>
                                <button
                                    className={`${styles.statusBtn} ${readingStatus === 'PLAN_TO_READ' ? styles.active : ''}`}
                                    onClick={() => handleStatusChange('PLAN_TO_READ')}
                                >
                                    <Library size={20} />
                                    <span>{t('bookDetails.wantToRead')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Global Rating (Community Score) */}
                        <div
                            className={styles.globalRating}
                            onClick={() => {
                                if (book) {
                                    navigate(`/reviews/${book.id}`);
                                    onClose();
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                            title="View all reviews"
                        >
                            <div className={styles.ratingValue}>
                                <Star size={20} fill="#f59e0b" stroke="#f59e0b" />
                                <span>3/5</span>
                            </div>
                            <span className={styles.ratingLabel}>{t('bookDetails.communityRating')}</span>
                            <span style={{ fontSize: '0.7rem', color: '#ea580c', marginTop: '2px' }}>{t('bookDetails.viewDetails')} &rarr;</span>
                        </div>
                    </div>


                    {/* Right Side: Details */}
                    <div className={styles.infoSection}>
                        {/* Header, Meta, Description... */}
                        <div className={styles.header}>
                            <span className={styles.categoryBadge}>
                                {book?.category?.name || (book?.categoryId ? `Category ID: ${book.categoryId}` : 'Uncategorized')}
                            </span>
                            <h2 className={styles.title} title={book?.title}>{book?.title}</h2>
                            <div className={styles.author}>
                                <User size={18} />
                                <span>{book?.author}</span>
                            </div>
                        </div>

                        {/* Meta Grid... */}
                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <Calendar size={18} className={styles.icon} />
                                <div>
                                    <label>{t('bookDetails.published')}</label>
                                    <span>{book?.publishedYear}</span>
                                </div>
                            </div>
                            <div className={styles.metaItem}>
                                <Hash size={18} className={styles.icon} />
                                <div>
                                    <label>{t('bookDetails.isbn')}</label>
                                    <span>{book?.isbn}</span>
                                </div>
                            </div>
                            <div className={styles.metaItem}>
                                <Tag size={18} className={styles.icon} />
                                <div>
                                    <label>{t('bookDetails.status')}</label>
                                    <span className={`${styles.status} ${styles[book?.status?.toLowerCase() || 'available']}`}>
                                        {book?.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.description}>
                            <h3>{t('bookDetails.description')}</h3>
                            <p>{book?.description || t('bookDetails.noDescription')}</p>
                        </div>

                        {token && (
                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    leftIcon={<BookOpen size={20} />}
                                    onClick={() => addToast('Start Reading functionality coming soon!', 'info')}
                                >
                                    {t('bookDetails.startReading')}
                                </Button>

                                <button
                                    className={styles.favoriteBtn}
                                    onClick={handleToggleFavorite}
                                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Heart size={24} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "currentColor"} />
                                </button>

                                {/* Delete Button for Owner or Admin */}
                                {user && (user.role === 'ADMIN' || (book?.userId && user.id === book.userId)) && (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => setShowDeleteModal(true)}
                                        title={t('bookDetails.deleteBook')}
                                    >
                                        <Trash2 size={24} color="#ef4444" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Auth Prompt Modal - Moved OUTSIDE .modal */}
            {showAuthPrompt && (
                <div
                    className={styles.authOverlay}
                    onClick={() => setShowAuthPrompt(false)}
                >
                    <div
                        className={styles.authModal}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={styles.authIcon}>
                            <User />
                        </div>
                        <h3>{t('bookDetails.loginRequired')}</h3>
                        <p>{t('bookDetails.loginMessage')}</p>
                        <div className={styles.authActions}>
                            <button className={styles.loginBtn} onClick={handleLoginRedirect}>
                                {t('bookDetails.loginBtn')}
                            </button>
                            <button className={styles.cancelBtn} onClick={() => setShowAuthPrompt(false)}>
                                {t('bookDetails.continueBrowsing')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t('bookDetails.deleteBook')}
                size="sm"
            >
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    {t('bookDetails.deleteConfirmation')}
                </p>
                <div className={styles.modalActions}>
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>{t('bookDetails.cancel')}</Button>
                    <Button variant="primary" onClick={handleDeleteBook} style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}>{t('bookDetails.delete')}</Button>
                </div>
            </Modal>
        </div>
    );
};