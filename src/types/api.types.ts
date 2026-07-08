// Single-resource endpoints (/api/me, PUT /api/books/:id, POST /api/books/:id/cost-price)
// all wrap their payload one level deeper than the list endpoint does.
export interface ApiEnvelope<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}
