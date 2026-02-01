export interface Book {
    id: number;
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    coverImage?: string;
    fileUrl?: string;
    publishedYear?: number;
    pageCount?: number;
    language?: string;
    status?: 'AVAILABLE' | 'BORROWED' | 'READING' | 'FINISHED' | 'WISHLIST';
    categoryId?: number;
    category?: {
        id: number;
        name: string;
        icon?: string;
    };
    userId?: number; // Owner ID
    createdAt?: string;
    updatedAt?: string;
}

export interface BookListResponse {
    data: Book[];
    total: number;
    page: number;
    limit: number;
}
