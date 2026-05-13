// src/types/pagination.ts

export type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // 현재 페이지
};