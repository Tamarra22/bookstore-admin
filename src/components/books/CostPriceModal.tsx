import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { booksApi } from '../../api/booksApi';
import type { Book, CostPriceData } from '../../types/book.types';
import type { ValidationErrorResponse } from '../../types/api.types';

interface CostPriceModalProps {
  book: Book;
  onClose: () => void;
}

export function CostPriceModal({ book, onClose }: CostPriceModalProps) {
  const [reason, setReason] = useState('');
  // null = not fetched yet. This is the only place the cost price value can
  // possibly exist, and it's only ever set inside the success branch below —
  // never pre-fetched, never attached to the Book object from the list.
  const [costPriceData, setCostPriceData] = useState<CostPriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await booksApi.getCostPrice(book.id, reason);
      setCostPriceData(data); // the value exists nowhere in the app until this line runs
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          const errors = (err.response.data as ValidationErrorResponse).errors;
          setError(errors.reason?.[0] ?? 'Validation failed.');
        } else if (err.response?.status === 403) {
          // Should be unreachable in normal use since HasPermission already
          // hides this button for unauthorized users — but the API enforces
          // it independently, so we handle it gracefully rather than crash.
          setError('You are not authorized to view the cost price.');
        } else {
          setError('Unable to retrieve cost price. Please try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Cost Price — ${book.title}`} onClose={onClose}>
      {costPriceData === null ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Reason (minimum 5 characters)"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : 'View cost price'}
          </Button>
        </form>
      ) : (
        <p className="text-lg font-semibold text-gray-900">
          Cost Price: {costPriceData.currency} {costPriceData.cost_price}
        </p>
      )}
    </Modal>
  );
}
