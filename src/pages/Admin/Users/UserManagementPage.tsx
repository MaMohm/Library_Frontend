import React, { useEffect, useState } from 'react';
import { Shield, Trash2, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store'; // Correct RootState import
import api from '@/services/api/axiosConfig'; // Use the configured axios instance
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Modal } from '@/components/common/Modal/Modal';
import styles from './UserManagementPage.module.scss';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
    createdAt: string;
}

export const UserManagementPage: React.FC = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const { addToast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: number | null }>({ isOpen: false, userId: null });
    const [updating, setUpdating] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            addToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            setUpdating(userId);
            await api.put(`/admin/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            addToast('User role updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update role', error);
            addToast('Failed to update user role', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.userId) return;

        try {
            await api.delete(`/admin/users/${deleteModal.userId}`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.filter(u => u.id !== deleteModal.userId));
            addToast('User deleted successfully', 'success');
            setDeleteModal({ isOpen: false, userId: null });
        } catch (error) {
            console.error('Failed to delete user', error);
            addToast('Failed to delete user', 'error');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1><Shield size={32} color="#8b5cf6" /> User Management</h1>
                <div style={{ width: '300px' }}>
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search size={18} />}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={styles.roleSelect}
                                            disabled={updating === user.id}
                                        >
                                            <option value="MEMBER">Member</option>
                                            <option value="LIBRARIAN">Librarian</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteModal({ isOpen: true, userId: user.id })}
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.empty}>No users found.</div>
                )}
            </div>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                title="Delete User"
            >
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, userId: null })}>Cancel</Button>
                    <Button variant="primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={handleDeleteUser}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};
