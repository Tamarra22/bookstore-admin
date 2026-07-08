import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { booksApi } from '../../api/booksApi';
import type { Book } from '../../types/book.types';
import type { ValidationErrorResponse } from '../../types/api.types';

interface EditBookModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBookModal({ book, onClose, onSuccess }: EditBookModalProps) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [retailPrice, setRetailPrice] = useState(book.retail_price);
  // The brief's prose only mentions title/author/retail price, but the API's
  // own validation rules require stock on every PUT — omitting it would make
  // every save fail with a 422, so it stays in the form.
  const [stock, setStock] = useState(String(book.stock));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await booksApi.updateBook(book.id, {
        title,
        author,
        retail_price: Number(retailPrice),
        stock: Number(stock),
      });
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setFieldErrors((err.response.data as ValidationErrorResponse).errors);
        } else if (err.response?.status === 403) {
          setFormError('You are not authorized to edit this book.');
        } else {
          setFormError('Something went wrong. Please try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Edit — ${book.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={fieldErrors.title?.[0]}
        />
        <Input
          label="Author"
          name="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          error={fieldErrors.author?.[0]}
        />
        <Input
          label="Retail Price"
          name="retail_price"
          type="number"
          step="0.01"
          value={retailPrice}
          onChange={(e) => setRetailPrice(e.target.value)}
          error={fieldErrors.retail_price?.[0]}
        />
        <Input
          label="Stock"
          name="stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          error={fieldErrors.stock?.[0]}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Modal>
  );
}
