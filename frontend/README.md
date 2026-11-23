# Palette — frontend

React 19 · Vite · React Router 7 · Tailwind CSS · Framer Motion

## Run it

The backend must be running first (see `../backend/README.md`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (React hooks rules included) |

The API address defaults to `http://localhost:8081`. To change it, create
`frontend/.env.local` with `VITE_API_BASE_URL=https://your-api`.

## How the code is organised

```
src/
  api/
    client.js        request(): adds the login token, sends/reads JSON, throws ApiError
    index.js         every endpoint, grouped: authApi, productsApi, cartApi, ordersApi, ...
  auth/
    AuthContext.jsx  useAuth(): user, login(), register(), logout()
    session.js       where the session is kept between visits (localStorage)
  lib/
    CurrencyContext.jsx  useCurrency(): currency, setCurrency(), format(pkr)
    money.js         formatPrice() — the one place prices are formatted
    room.js          floor/wall area, same formulas as the backend
  components/        shared pieces (PageLoader, OrderSuccessCard, ...)
  pages/             one file per screen, each loaded on demand
  App.jsx            routes; ProtectedRoute / GuestOnlyRoute
  main.jsx           providers: Router → Auth → Currency → App
```

### Rules of thumb

- **Never call `fetch` in a page.** Use the functions in `src/api`. Errors come
  back as `ApiError` with a readable `message` from the server.
- **Get the user with `useAuth()`**, not from props. When the server rejects the
  token, the app logs out and goes to `/login` automatically.
- **Format money with `useCurrency().format(pkr)`.** Prices are stored in PKR; the
  user's choice of PKR or USD is applied everywhere. Payment pages always show
  PKR, because that is what is charged.
- **Catalogue filters live in the URL** (`/catalog?category=SOFA&maxPrice=100000`),
  so filtered views can be shared and survive a refresh.

## Login flow

1. `login()` / `register()` store `{ userId, fullName, token, ... }` in localStorage.
2. Every API call sends `Authorization: Bearer <token>`.
3. Visiting a protected page while logged out redirects to `/login`. After
   logging in, the user is sent back to the page they wanted.
