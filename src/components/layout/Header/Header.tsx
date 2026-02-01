import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import styles from './Header.module.scss';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { LanguageSelector } from '@/components/common/LanguageSelector/LanguageSelector';

interface HeaderProps {
    onMenuClick: () => void;
    isDark: boolean;
    toggleTheme: () => void;
}

import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

import { bookApi } from '@/services/api/bookApi';
import { Book } from '@/types/book.types';
import { BookOpen } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isDark, toggleTheme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Book[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = React.useRef<HTMLFormElement>(null);
    const navigate = useNavigate();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const { t } = useTranslation();

    // Close suggestions when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim().length > 0) {
            try {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (book: Book) => {
        setSearchQuery('');
        setShowSuggestions(false);
        navigate(`/books?search=${encodeURIComponent(book.title)}`);
    };

    const getImageUrl = (book: Book) => {
        if (!book.coverImage) return null;
        if (book.coverImage.startsWith('http')) return book.coverImage;
        return `https://library-api.marwandev.com${book.coverImage}`;
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Button variant="ghost" className={styles.menuBtn} onClick={onMenuClick}>
                    <Menu size={24} />
                </Button>

                {/* Search Container */}
                <form onSubmit={handleSearch} className={styles.searchContainer} ref={searchRef}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <Input
                            placeholder={t('header.searchPlaceholder')}
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (searchQuery.trim().length > 0) setShowSuggestions(true);
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
                </form>
            </div>

            <div className={styles.right}>
                <Button variant="ghost" className={styles.iconBtn} onClick={toggleTheme}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                {token ? (
                    <>
                        <div style={{ marginRight: '0.5rem' }}>
                            <LanguageSelector />
                        </div>
                        <div className={styles.userAvatar} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent((user as any)?.name || 'User')}&background=dec973&color=fff`}
                                alt="User"
                            />
                        </div>
                    </>
                ) : (
                    <Button onClick={() => navigate('/login')}>{t('header.login')}</Button>
                )}
            </div>
        </header>
    );
};
