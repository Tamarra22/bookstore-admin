import { api } from './axiosInstance';
import type { ApiEnvelope, PaginatedResponse } from '../types/api.types';
import type { Book, CostPriceData, UpdateBookPayload } from '../types/book.types';

export const booksApi = {
  // The paginated list's top-level shape (data/meta/links) is already the
  // shape we want — no extra envelope to unwrap here, unlike the single-
  // resource endpoints below.
  getBooks: (page: number) =>
    api
      .get<PaginatedResponse<Book>>('/api/books', { params: { page } })
      .then((res) => res.data),

  updateBook: (id: number, payload: UpdateBookPayload) =>
    api.put<ApiEnvelope<Book>>(`/api/books/${id}`, payload).then((res) => res.data.data),

  getCostPrice: (id: number, reason: string) =>
    api
      .post<ApiEnvelope<CostPriceData>>(`/api/books/${id}/cost-price`, { reason })
      .then((res) => res.data.data),
};
