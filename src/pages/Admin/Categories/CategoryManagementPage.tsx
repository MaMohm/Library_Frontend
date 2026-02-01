import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import api from '@/services/api/axiosConfig';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Modal } from '@/components/common/Modal/Modal';
import { FolderOpen, Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import styles from './CategoryManagementPage.module.scss';

interface Category {
    id: number;
    name: string;
    description?: string;
    _count?: { books: number };
}

export const CategoryManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { addToast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState<{ isOpen: boolean; category: Category | null }>({
        isOpen: false,
        category: null
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: number | null }>({
        isOpen: false,
        categoryId: null
    });
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchCategories();
    }, [user]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await api.get('/categories', config);
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
            addToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!formData.name.trim()) {
            addToast('Category name is required', 'error');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/categories', formData, config);
            addToast('Category created successfully', 'success');
            setAddModal(false);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            console.error('Failed to create category', error);
            addToast('Failed to create category', 'error');
        }
    };

    const handleEditCategory = async () => {
        if (!editModal.category || !formData.name.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/categories/${editModal.category.id}`, formData, config);
            addToast('Category updated successfully', 'success');
            setEditModal({ isOpen: false, category: null });
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            console.error('Failed to update category', error);
            addToast('Failed to update category', 'error');
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteModal.categoryId) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/categories/${deleteModal.categoryId}`, config);
            addToast('Category deleted successfully', 'success');
            setDeleteModal({ isOpen: false, categoryId: null });
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category', error);
            addToast('Failed to delete category', 'error');
        }
    };

    const openEditModal = (category: Category) => {
        setFormData({ name: category.name, description: category.description || '' });
        setEditModal({ isOpen: true, category });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1><FolderOpen size={32} color="#f59e0b" /> Category Management</h1>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading categories...</div>
            ) : (
                <div className={styles.grid}>
                    {/* Add Category Card */}
                    <div className={styles.addCard} onClick={() => setAddModal(true)}>
                        <Plus size={32} color="var(--color-text-secondary)" />
                        <span>Add New Category</span>
                    </div>

                    {categories.map(category => (
                        <div key={category.id} className={styles.categoryCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.categoryName}>{category.name}</h3>
                                <div className={styles.cardActions}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditModal(category)}
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteModal({ isOpen: true, categoryId: category.id })}
                                        style={{ color: '#ef4444' }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                            <div className={styles.bookCount}>
                                <BookOpen size={16} />
                                {category._count?.books || 0} books
                            </div>
                            {category.description && (
                                <p className={styles.description}>{category.description}</p>
                            )}
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className={styles.empty}>No categories found. Create your first category!</div>
                    )}
                </div>
            )}

            {/* Add Category Modal */}
            <Modal
                isOpen={addModal}
                onClose={() => { setAddModal(false); setFormData({ name: '', description: '' }); }}
                title="Add New Category"
            >
                <div className={styles.formGroup}>
                    <label>Category Name</label>
                    <Input
                        placeholder="Enter category name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Description (Optional)</label>
                    <Input
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={() => { setAddModal(false); setFormData({ name: '', description: '' }); }}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddCategory}>
                        Create Category
                    </Button>
                </div>
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={() => { setEditModal({ isOpen: false, category: null }); setFormData({ name: '', description: '' }); }}
                title="Edit Category"
            >
                <div className={styles.formGroup}>
                    <label>Category Name</label>
                    <Input
                        placeholder="Enter category name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Description (Optional)</label>
                    <Input
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={() => { setEditModal({ isOpen: false, category: null }); setFormData({ name: '', description: '' }); }}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditCategory}>
                        Save Changes
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
                title="Delete Category"
            >
                <p>Are you sure you want to delete this category? Books in this category will become uncategorized.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, categoryId: null })}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                        onClick={handleDeleteCategory}
                    >
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
