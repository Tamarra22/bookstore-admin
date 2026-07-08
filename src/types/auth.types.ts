// Shape returned by GET /api/me
export interface User {
  id: number;
  name: string;
  permissions: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

// POST /api/login returns everything /api/me does, plus email and the bearer token.
export interface LoginResponseData extends User {
  email: string;
  token: string;
}
