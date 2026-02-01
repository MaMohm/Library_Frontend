
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, User, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';

// Mock data for demo
const MOCK_REVIEWS = [
    {
        id: 1,
        user: "Sarah Johnson",
        rating: 5,
        date: "2 days ago",
        content: "Absolutely loved this! The insights into 19th-century domestic life are fascinating. A must-read for history buffs.",
        likes: 12
    },
    {
        id: 2,
        user: "Ahmed Ali",
        rating: 4,
        date: "1 week ago",
        content: "Great content, though the language is a bit archaic. Still, very valuable for understanding the context.",
        likes: 5
    },
    {
        id: 3,
        user: "Maria Rodriguez",
        rating: 5,
        date: "2 weeks ago",
        content: "Reading this was like time travel. Highly recommend!",
        likes: 8
    }
];

export const ReviewsPage = () => {
    // const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                style={{ marginBottom: '2rem' }}
            >
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Back to Book
            </Button>

            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    borderBottom: '1px solid #f3f4f6',
                    paddingBottom: '1rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', marginBottom: '0.5rem' }}>Community Reviews</h1>
                        <p style={{ color: '#6b7280' }}>What others are saying</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: '#1f2937'
                        }}>
                            <Star size={32} fill="#f59e0b" stroke="#f59e0b" />
                            <span>4.7</span>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Based on 128 reviews</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {MOCK_REVIEWS.map(review => (
                        <div key={review.id} style={{
                            padding: '1.5rem',
                            background: '#f9fafb',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#dbeafe',
                                        color: '#2563eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#111827', fontWeight: '600' }}>{review.user}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{review.date}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < review.rating ? "#f59e0b" : "none"}
                                            stroke={i < review.rating ? "#f59e0b" : "#d1d5db"}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '1rem' }}>
                                {review.content}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                <button style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer'
                                }}>
                                    <ThumbsUp size={16} />
                                    Helpful ({review.likes})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
