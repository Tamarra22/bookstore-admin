export interface Book {
  id: number;
  title: string;
  author: string;
  // The API sends a pre-formatted decimal string in responses (e.g. "499.00"),
  // not a number. Keep it a string here so we don't silently misrepresent it.
  retail_price: string;
  stock: number;
  currency: string;
}

// PUT /api/books/:id expects a numeric retail_price in the request body,
// even though responses return it as a string.
export interface UpdateBookPayload {
  title: string;
  author: string;
  retail_price: number;
  stock: number;
}

export interface CostPriceData {
  id: number;
  cost_price: string;
  currency: string;
}
