# Palette — backend

Spring Boot 3.5 · Java 21 · PostgreSQL · Flyway

## Run it locally

1. Create an empty database:
   ```sql
   CREATE DATABASE palette;
   ```
2. Copy `.env.example` to `.env`, then set `DB_PASSWORD` and `JWT_SECRET` (at least 32 random
   characters). The `.env` file is git-ignored.
3. Start the API from the `backend` folder (so `.env` is found):
   ```bash
   mvn spring-boot:run
   ```
   It runs on http://localhost:8081.

On first start, Flyway creates every table and loads the catalog
(122 products, 6 designers, 3 styles) from `src/main/resources/db/migration`.

## Login and API access

`POST /api/auth/register` and `POST /api/auth/login` return a `token`.
Send it on every request that belongs to a user:

```
Authorization: Bearer <token>
```

The server reads the user from the token. No endpoint takes a `userId`, so
nobody can read or change another user's cart, orders, rooms or payments.

| Open to everyone | Needs a token |
|---|---|
| `GET /api/products/**`, `GET /api/designers/**` | `/api/cart/**` |
| `GET /api/room-builder/products/{roomType}` | `/api/order/**` |
| `POST /api/design-quiz/submit` (saved only when logged in) | `/api/payment/**` (except `/health`) |
| `/api/auth/**` | `/api/room-builder/**`, `GET /api/design-quiz/latest` |

Prices always come from the server: the cart and orders use catalogue prices,
and a payment always charges the order's own total.

## Database changes

Flyway owns the schema, and Hibernate runs with `ddl-auto=validate`, so it only
*checks* the tables and never changes them.
To change the schema, add a new file such as `V3__add_wishlist.sql`.
Never edit a migration that has already been applied.

### Coming from the old schema?

Before Flyway, Hibernate built the tables itself (`ddl-auto=update`), and they
picked up duplicate columns. Flyway refuses to run on that old database. Keep it
as a backup and start fresh:

```sql
ALTER DATABASE palette RENAME TO palette_legacy;
CREATE DATABASE palette;
```

## Tests

```bash
mvn test
```

Tests use an in-memory H2 database in PostgreSQL mode, built by the same
migrations, so no database or Docker is needed. They cover:

- each design pattern (`src/test/.../patterns`)
- the seed data, including that every product ID the style quiz recommends
  exists with the right style and room
- the full checkout flow: register → cart → order → payment, including retrying a failed payment
- API security: which endpoints are public, tokens, and that one user can't touch another's data
- Room Builder pricing (floor area vs wall area) and the style quiz
