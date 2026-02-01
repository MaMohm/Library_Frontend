import api from './axiosConfig';

export interface Category {
    id: number;
    name: string;
    nameAr?: string;
    icon?: string;
    _count?: {
        books: number;
    };
}

export const categoryApi = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    create: async (data: { name: string; nameAr?: string; icon?: string }) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/categories/${id}`);
    }
};
