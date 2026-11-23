# Palette — backend

Spring Boot 3.5 · Java 21 · PostgreSQL · Flyway

## Run it locally

1. Create an empty database:
   ```sql
   CREATE DATABASE palette;
   ```
2. Copy `.env.example` to `.env` and set `DB_PASSWORD` (the `.env` file is git-ignored).
3. Start the API from the `backend` folder (so `.env` is found):
   ```bash
   mvn spring-boot:run
   ```
   It runs on http://localhost:8081.

On first start, Flyway creates every table and loads the catalog
(122 products, 6 designers, 3 styles) from `src/main/resources/db/migration`.

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
- the full checkout flow: register → cart → order → payment
