# Bookstore Admin

A small React admin UI for a bookstore, built for the take-home exam. Talks to
`https://reactdeveloperexam.ymcargo.tech`.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- React Router
- Axios (single instance, request/response interceptors)
- No Redux — auth/permissions live in Context, everything else (books list,
  form state, modal state) is local component/hook state. There's no shared
  state complex enough to justify a global store.

## Running it

```bash
npm install
cp .env.example .env   # defaults to the exam's base URL, edit if needed
npm run dev
```

Then sign in with one of the test accounts:

| Email | Password | Can view cost price? |
|---|---|---|
| manager@test.com | password | Yes |
| staff@test.com | password | No — button is not rendered at all |

## Project structure

```
src/
  api/          axios instance + interceptors, one module per resource (auth, books)
  components/
    ui/         generic, reusable, no domain knowledge (Button, Input, Modal, Table, Pagination)
    common/     small cross-cutting components (HasPermission)
    books/      feature components composed from ui/ (CostPriceModal, EditBookModal)
  context/      AuthContext — the one global state concern in the app
  hooks/        useAuth, usePermission, useBooks — business logic, kept out of components
  layouts/      AppLayout — nav bar + logout, wraps protected pages
  pages/        one component per route (LoginPage, BooksPage)
  routes/       route table + ProtectedRoute guard
  types/        shared TS contracts, matched to the actual API response shapes
  utils/        storage.ts — single place that touches localStorage
```

## Key decisions

**Permission-gated button uses conditional rendering, not `disabled` or CSS.**
Returning `null` from JSX means React never creates that DOM node. `disabled`
still puts the button in the DOM (visible in devtools, attribute removable).
CSS hiding is worse — element is present and interactable via devtools or
automation, just invisible. Only conditional rendering makes "the button must
not exist in the DOM" literally true. This is a UX/defense-in-depth measure —
the API independently enforces `books.cost_price.view` server-side (returns
403 otherwise), which is the actual security boundary.

**Cost price never enters the DOM before the request succeeds.** It's held in
`useState<CostPriceData | null>(null)` scoped to `CostPriceModal`, only ever
set inside the `.then()` of a successful `POST /api/books/:id/cost-price`. It's
never pre-fetched, never attached to the `Book` object from the list, and the
whole modal unmounts on close so nothing lingers between opens.

**`/api/me` is called after login even though the login response already
includes `permissions`.** This means login and page-refresh hydration both go
through the exact same function, so there's one source of truth for "who is
the current user" instead of trusting two slightly different response shapes
to stay in sync. One extra request, meaningfully less drift risk.

**401 is handled globally (axios interceptor → logout + redirect); 422 and 403
are handled at the call site.** A 401 means the same thing everywhere ("you're
not logged in"). A 422 or 403 means something different per action (which
field is wrong, or which specific operation is forbidden) — that has to be
handled where the request is made, not centralized.

**Edit form includes a Stock field.** The exam brief's prose only mentions
title/author/retail price, but the API's own validation table lists `stock`
as `required` on `PUT /api/books/:id`. Omitting it would make every save fail
with a 422, so it's included. Flagging this explicitly since it's a case
where the brief and the API contract didn't fully match.

**`retail_price` is typed as `string` in `Book` but `number` in
`UpdateBookPayload`.** The API really does send a pre-formatted decimal string
in responses (`"499.00"`) but expects a number in request bodies — the types
make that asymmetry visible instead of silently coercing it away.

## What I used AI for

Used Claude for: scaffolding the layered architecture (api → hooks →
components), the interceptor-based auth flow, and reconciling the initial
assumed API contract against the real `EXAM_API.md` once it was available
(the envelope wrapping, string-typed prices, and the missing `stock` field in
the brief were all things Claude flagged when the real docs were compared
against the first draft). All code was reviewed line-by-line against the
actual API docs before finalizing.

## What I'd do differently with more time

- Add a small test suite (Vitest + React Testing Library) for `usePermission`,
  the axios interceptor's 401 behavior, and the cost-price modal's "never
  renders before success" guarantee — that last one is exactly the kind of
  thing worth locking in with a regression test.
- Debounce or cache `useBooks` page fetches if the list were large enough for
  rapid pagination clicks to matter.
- Consider extracting a small `useAsyncAction` hook — `EditBookModal` and
  `CostPriceModal` both hand-roll the same `isSubmitting` / try-catch-finally
  shape. Left duplicated deliberately for now since it's only two call sites
  and the abstraction wasn't obviously worth it yet.

## Decisions I'm unsure about

- Whether Edit should be a full page (`/books/:id/edit`) instead of a modal —
  went with a modal since it keeps the user on the paginated list and mirrors
  the cost-price modal pattern, but a dedicated route is equally defensible
  and would demonstrate nested routing more explicitly.
- Whether `GET /api/books` being unauthenticated per the docs means the books
  list itself should be viewable without login. I kept the whole app behind
  the login gate since the brief describes login as the entry point ("on
  success... redirect to the books list"), but the API would technically
  support a public books page.
