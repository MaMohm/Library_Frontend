import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi, Category } from '@/services/api/categoryApi';
import { Card } from '@/components/common/Card/Card';
import styles from './CategoriesPage.module.scss';
import { useTranslation } from 'react-i18next';
import {
    Tag,
    Book,
    FlaskConical,
    Cpu,
    Landmark,
    Briefcase,
    Brain,
    Heart,
    Ghost,
    Sword,
    Palette,
    Globe,
    Utensils
} from 'lucide-react';

interface CategoryConfig {
    icon: React.ReactNode;
    color: string;
    descriptionKey?: string;
}

const getCategoryConfig = (name: string): CategoryConfig => {
    const normalized = name.toLowerCase();
    if (normalized.includes('science') || normalized.includes('physics')) return { icon: <FlaskConical size={32} />, color: '#3b82f6', descriptionKey: 'science' };
    if (normalized.includes('tech') || normalized.includes('computer')) return { icon: <Cpu size={32} />, color: '#8b5cf6', descriptionKey: 'technology' };
    if (normalized.includes('history')) return { icon: <Landmark size={32} />, color: '#d97706', descriptionKey: 'history' };
    if (normalized.includes('business') || normalized.includes('finance')) return { icon: <Briefcase size={32} />, color: '#10b981', descriptionKey: 'business' };
    if (normalized.includes('philosophy')) return { icon: <Brain size={32} />, color: '#ec4899', descriptionKey: 'philosophy' };
    if (normalized.includes('psychology')) return { icon: <Brain size={32} />, color: '#ec4899', descriptionKey: 'psychology' };
    if (normalized.includes('fantasy')) return { icon: <Sword size={32} />, color: '#f59e0b', descriptionKey: 'fantasy' };
    if (normalized.includes('romance')) return { icon: <Heart size={32} />, color: '#ef4444', descriptionKey: 'romance' };
    if (normalized.includes('horror')) return { icon: <Ghost size={32} />, color: '#1f2937', descriptionKey: 'horror' };
    if (normalized.includes('thriller')) return { icon: <Ghost size={32} />, color: '#1f2937', descriptionKey: 'thriller' };
    if (normalized.includes('art')) return { icon: <Palette size={32} />, color: '#ec4899', descriptionKey: 'art' };
    if (normalized.includes('design')) return { icon: <Palette size={32} />, color: '#ec4899', descriptionKey: 'design' };
    if (normalized.includes('fiction')) return { icon: <Book size={32} />, color: '#6366f1', descriptionKey: 'fiction' };
    if (normalized.includes('travel')) return { icon: <Globe size={32} />, color: '#0ea5e9', descriptionKey: 'travel' };
    if (normalized.includes('cooking')) return { icon: <Utensils size={32} />, color: '#f97316', descriptionKey: 'cooking' };
    if (normalized.includes('food')) return { icon: <Utensils size={32} />, color: '#f97316', descriptionKey: 'food' };

    return { icon: <Tag size={32} />, color: '#64748b', descriptionKey: 'general' };
};

export const CategoriesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getAll();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📂 {t('categories.title')}</h1>
                <p>{t('categories.subtitle')}</p>
            </div>

            {loading ? (
                <div>{t('categories.loading')}</div>
            ) : categories.length > 0 ? (
                <div className={styles.grid}>
                    {categories.map((cat) => {
                        const config = getCategoryConfig(cat.name);
                        return (
                            <Card
                                key={cat.id}
                                className={styles.card}
                                onClick={() => navigate(`/books?category=${cat.id}`)}
                            >
                                <div
                                    className={styles.iconWrapper}
                                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                >
                                    {config.icon}
                                </div>
                                <div className={styles.content}>
                                    <h3>{cat.name}</h3>
                                    <p className={styles.description}>
                                        {config.descriptionKey ? t(`categories.descriptions.${config.descriptionKey}`) : t('categories.descriptions.general')}
                                    </p>
                                    <div className={styles.meta}>
                                        <Book size={16} />
                                        <span>{cat._count?.books || 0} {t('categories.books')}</span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.empty}>
                    <p>{t('categories.noCategories')}</p>
                </div>
            )}
        </div>
    );
};
