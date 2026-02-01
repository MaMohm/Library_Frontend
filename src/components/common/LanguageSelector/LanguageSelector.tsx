import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import styles from './LanguageSelector.module.scss';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';

interface Language {
    code: string;
    name: string;
    flag: string;
    dir: 'ltr' | 'rtl';
}

const LANGUAGES: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', dir: 'ltr' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
];

export const LanguageSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();
    const { i18n } = useTranslation();

    // Init direction based on current language
    useEffect(() => {
        const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
        document.documentElement.dir = currentLang.dir;
        document.documentElement.lang = currentLang.code;
    }, [i18n.language]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: string, name: string, dir: 'ltr' | 'rtl') => {
        i18n.changeLanguage(code);
        document.documentElement.dir = dir;
        document.documentElement.lang = code;
        setIsOpen(false);
        addToast(`Language changed to ${name}`, 'success');
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                className={`${styles.triggerBtn} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Select Language"
            >
                <Globe size={20} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`${styles.languageItem} ${i18n.language === lang.code ? styles.selected : ''}`}
                            onClick={() => handleSelect(lang.code, lang.name, lang.dir)}
                        >
                            <span className={styles.flag}>{lang.flag}</span>
                            <span className={styles.label}>{lang.name}</span>
                            {i18n.language === lang.code && (
                                <Check size={16} className={styles.check} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
