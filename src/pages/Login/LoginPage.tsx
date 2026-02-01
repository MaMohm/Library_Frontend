import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.scss';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { Button } from '@/components/common/Button/Button';
import { Library } from 'lucide-react';
import { authApi } from '@/services/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/app/authSlice';
import { useTranslation } from 'react-i18next';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        email: 'admin@library.com',
        password: 'password123'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🔐 Attempting login...');

        try {
            const response = await authApi.login({
                email: formData.email,
                password: formData.password
            });

            console.log('✅ Login API Response:', response);

            // API returns 'accessToken', not 'token'
            const token = (response as any).accessToken || (response as any).token;

            if (!token) {
                throw new Error('No token received from server');
            }

            // ⚠️ Force save to localStorage FIRST
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(response.user));

            console.log('💾 Token saved to localStorage:', token.substring(0, 30) + '...');
            console.log('👤 User saved:', response.user);

            // Then save to Redux
            dispatch(setCredentials({
                user: response.user,
                token: token
            }));

            console.log('✅ Redux state updated');

            // Verification
            const savedToken = localStorage.getItem('token');
            console.log('🔍 Verification - Token in localStorage:', savedToken ? '✅ Found' : '❌ Missing');

            // Short delay to ensure storage persistence
            setTimeout(() => {
                console.log('🚀 Navigating to dashboard...');
                navigate('/');
            }, 200);

        } catch (err: any) {
            console.error('❌ Login Error:', err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Login failed. Please check your credentials.';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.background}>
                <div className={styles.circle1} />
                <div className={styles.circle2} />
            </div>

            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <Library size={32} color="#dec973" />
                    </div>
                    <h1>{t('header.login')}</h1>
                    <p>Sign in to manage your home library</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@library.com"
                        required
                        disabled={loading}
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••••"
                        required
                        disabled={loading}
                    />

                    <div className={styles.actions}>
                        <a href="#" className={styles.forgotPass}>
                            Forgot Password?
                        </a>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        isLoading={loading}
                    >
                        {t('header.login')}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>Don't have an account? <a href="#">Create one</a></p>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <Button
                            variant="outline"
                            style={{ width: '100%', borderColor: '#dec973', color: '#bfa75a' }}
                            onClick={() => navigate('/books')}
                            type="button"
                        >
                            🌍 Continue as Visitor
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
