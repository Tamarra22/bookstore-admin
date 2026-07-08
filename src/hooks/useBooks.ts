import { useCallback, useEffect, useState } from 'react';
import { booksApi } from '../api/booksApi';
import type { Book } from '../types/book.types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback((page: number) => {
    setIsLoading(true);
    setError(null);
    booksApi
      .getBooks(page)
      .then((response) => {
        setBooks(response.data);
        setCurrentPage(response.meta.current_page);
        setLastPage(response.meta.last_page);
      })
      .catch(() => setError('Failed to load books. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchBooks(currentPage);
    // fetchBooks is stable (empty dependency array), so this effect only
    // re-runs on genuine page changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return {
    books,
    currentPage,
    lastPage,
    isLoading,
    error,
    setPage: setCurrentPage,
    refetch: () => fetchBooks(currentPage),
  };
}
