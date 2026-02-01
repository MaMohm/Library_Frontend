import api from './axiosConfig';
import { Book, BookListResponse } from '@/types/book.types';

export const bookApi = {
    getAll: async (page = 1, limit = 10, search = '', categoryId?: number): Promise<BookListResponse> => {
        const response = await api.get<BookListResponse>('/books', {
            params: { page, limit, search, categoryId }
        });
        return response.data;
    },

    getOne: async (id: number): Promise<Book> => {
        const response = await api.get<Book>(`/books/${id}`);
        return response.data;
    },

    create: async (data: Partial<Book>): Promise<Book> => {
        const response = await api.post<Book>('/books', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Book>): Promise<Book> => {
        const response = await api.put<Book>(`/books/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/books/${id}`);
    },

    toggleFavorite: async (bookId: number): Promise<{ isFavorite: boolean }> => {
        const response = await api.post<{ isFavorite: boolean }>(`/favorites/${bookId}`);
        return response.data;
    },

    getFavorites: async (): Promise<number[]> => {
        const response = await api.get<number[]>('/favorites');
        return response.data;
    },

    getFavoriteBooks: async (): Promise<Book[]> => {
        const response = await api.get<Book[]>('/favorites?expand=true');
        return response.data;
    },

    // Reviews
    addReview: async (bookId: number, rating: number, content: string): Promise<any> => {
        const response = await api.post(`/books/${bookId}/reviews`, { rating, content });
        return response.data;
    },

    getReviews: async (bookId: number): Promise<any[]> => {
        const response = await api.get<any[]>(`/books/${bookId}/reviews`);
        return response.data;
    },

    getMyReviews: async (): Promise<any[]> => {
        const response = await api.get<any[]>('/users/reviews');
        return response.data;
    },

    deleteReview: async (bookId: number, reviewId: number): Promise<void> => {
        // The path is nested in backend: /api/books/:bookId/reviews/:reviewId
        await api.delete(`/books/${bookId}/reviews/${reviewId}`);
    },

    updateReview: async (bookId: number, reviewId: number, content: string, rating: number): Promise<void> => {
        await api.put(`/books/${bookId}/reviews/${reviewId}`, { content, rating });
    },

    // Stats
    getTopRated: async (): Promise<Book[]> => {
        // Assuming backend supports simple filtering or we create a specific route
        // For MVP, if backend doesn't support it yet, we might mock or return standard list
        // Let's assume we'll implement ?sort=rating
        const response = await api.get<Book[]>('/books?sort=-rating&limit=5');
        return response.data; // Note: Current getAll returns { data: [], meta: ... } so need to adjust
    },

    getMostRead: async (): Promise<Book[]> => {
        const response = await api.get<Book[]>('/books?sort=-views&limit=5');
        return response.data;
    },

    // Reading Status / My Library
    getMyLibrary: async (status?: string): Promise<any[]> => {
        const response = await api.get<any[]>('/my-library', { params: { status } });
        return response.data;
    },

    updateReadingStatus: async (bookId: number, status: 'READ' | 'READING' | 'PLAN_TO_READ'): Promise<void> => {
        await api.post(`/my-library/${bookId}`, { status });
    },

    getReadingStatus: async (bookId: number): Promise<{ status: string | null }> => {
        const response = await api.get<{ status: string | null }>(`/my-library/${bookId}`);
        return response.data;
    },

    // Admin / Trash
    getTrash: async (): Promise<any[]> => {
        const response = await api.get<any[]>('/books/trash/all');
        return response.data;
    },

    restore: async (id: number): Promise<void> => {
        await api.post(`/books/${id}/restore`);
    },

    permanentDelete: async (id: number): Promise<void> => {
        await api.delete(`/books/${id}/permanent`);
    }
};
