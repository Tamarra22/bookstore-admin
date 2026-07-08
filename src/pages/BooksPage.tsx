import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import { Table } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { HasPermission } from '../components/common/HasPermission';
import { CostPriceModal } from '../components/books/CostPriceModal';
import { EditBookModal } from '../components/books/EditBookModal';
import type { Book } from '../types/book.types';

export function BooksPage() {
  const { books, currentPage, lastPage, isLoading, error, setPage, refetch } = useBooks();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [costPriceBook, setCostPriceBook] = useState<Book | null>(null);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading books...</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="secondary" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (books.length === 0) {
    return <p className="text-sm text-gray-500">No books found.</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Books</h1>

      <Table<Book>
        rowKey={(book) => book.id}
        data={books}
        columns={[
          { key: 'title', header: 'Title', render: (b) => b.title },
          { key: 'author', header: 'Author', render: (b) => b.author },
          {
            key: 'retail_price',
            header: 'Retail Price',
            render: (b) => `${b.currency} ${b.retail_price}`,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (b) => (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditingBook(b)}>
                  Edit
                </Button>
                <HasPermission permission="books.cost_price.view">
                  <Button variant="secondary" onClick={() => setCostPriceBook(b)}>
                    View cost price
                  </Button>
                </HasPermission>
              </div>
            ),
          },
        ]}
      />

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setPage} />

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSuccess={() => {
            setEditingBook(null);
            refetch();
          }}
        />
      )}

      {costPriceBook && (
        <CostPriceModal book={costPriceBook} onClose={() => setCostPriceBook(null)} />
      )}
    </div>
  );
}
