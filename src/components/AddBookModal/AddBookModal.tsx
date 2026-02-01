import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import api from '@/services/api/axiosConfig';
import styles from './AddBookModal.module.scss';

interface AddBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Category {
    id: number;
    name: string;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        title: '',
        author: '',
        isbn: '',
        description: '',
        publishedYear: '',
        categoryId: '',
        coverImage: ''
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/books', {
                ...form,
                publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null,
                categoryId: form.categoryId ? parseInt(form.categoryId) : null
            });
            onSuccess();
            onClose();
            setForm({ title: '', author: '', isbn: '', description: '', publishedYear: '', categoryId: '', coverImage: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Add New Book</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Title *</label>
                            <Input
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Book title"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Author *</label>
                            <Input
                                value={form.author}
                                onChange={e => setForm({ ...form, author: e.target.value })}
                                placeholder="Author name"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ISBN</label>
                            <Input
                                value={form.isbn}
                                onChange={e => setForm({ ...form, isbn: e.target.value })}
                                placeholder="978-..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Published Year</label>
                            <Input
                                type="number"
                                value={form.publishedYear}
                                onChange={e => setForm({ ...form, publishedYear: e.target.value })}
                                placeholder="2024"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={form.categoryId}
                                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                className={styles.select}
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Cover Image URL</label>
                            <Input
                                value={form.coverImage}
                                onChange={e => setForm({ ...form, coverImage: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Book description..."
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Book'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
