<div align="center">

# Palette

**Furniture and interior design, planned room by room.**

Shop furniture by room and style, plan a whole room with live pricing, discover your interior style, and book a designer. Built as a Software Design & Architecture project that puts seven classic design patterns to work in a real full-stack app.

![Java 21](https://img.shields.io/badge/Java-21-C4522A)
![Spring Boot 3.5](https://img.shields.io/badge/Spring%20Boot-3.5-627054)
![React 19](https://img.shields.io/badge/React-19-38241C)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Flyway-627054)
![Tests](https://img.shields.io/badge/backend%20tests-97%20passing-2E7D4F)

![Palette landing page](docs/screenshots/01-landing.jpg)

</div>

## Contents

- [What it does](#what-it-does)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Design patterns](#design-patterns)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Security](#security)
- [Testing](#testing)
- [Design system](#design-system)
- [Project structure](#project-structure)

## What it does

| Feature | What you can do |
|---|---|
| **Shop the catalog** | Browse 122 products with filters for category, room, style and budget. Each filter shows how many results it would give. Search, sort and share any filtered view by URL. |
| **Shop the room** | Select dots on the landing-page room photo to see similar pieces from the catalog. |
| **Room planner** | Pick a room, enter its size, choose a floor and wallpaper, add furniture, and watch the price add up. The server builds and prices the room and adds it to your cart as one item. |
| **Style quiz** | Answer four questions to find your style (Minimalist, Scandinavian or Bohemian), then get a set of pieces picked for the room you choose. |
| **Designers** | Filter interior designers by style and hourly rate, read their profiles and contact them. |
| **Cart and checkout** | A slide-in cart on every page, a three-step checkout, and payment through Stripe (card) or JazzCash (mobile wallet). |
| **Orders** | Follow every order and its status, and pay for any order left unpaid. |
| **Currency** | Switch prices between PKR and USD at any time. |

## Screenshots

All screenshots come from the running app with real data from the seeded catalog.

### Landing

| Home | Shop the room |
|---|---|
| ![Home](docs/screenshots/01-landing.jpg) | ![Shop the room hotspot](docs/screenshots/02-landing-shop-the-room.jpg) |
| **Three styles** | **Room planner preview** |
| ![Styles](docs/screenshots/03-landing-styles.jpg) | ![Planner section](docs/screenshots/04-landing-planner.jpg) |

### Account

| Sign in | Create account |
|---|---|
| ![Sign in](docs/screenshots/05-sign-in.jpg) | ![Create account](docs/screenshots/06-create-account.jpg) |
| **Overview** | |
| ![Overview](docs/screenshots/07-overview.jpg) | |

### Shopping

| Catalog | Filtered catalog |
|---|---|
| ![Catalog](docs/screenshots/08-catalog.jpg) | ![Filtered catalog](docs/screenshots/09-catalog-filtered.jpg) |
| **Product** | **Cart** |
| ![Product](docs/screenshots/10-product.jpg) | ![Cart drawer](docs/screenshots/11-cart-drawer.jpg) |

### Style quiz

| Question | Your style |
|---|---|
| ![Quiz question](docs/screenshots/12-style-quiz.jpg) | ![Style result](docs/screenshots/13-style-result.jpg) |
| **Recommendations** | |
| ![Recommendations](docs/screenshots/14-style-recommendations.jpg) | |

### Room planner

| Choose a room | Size and floor |
|---|---|
| ![Choose a room](docs/screenshots/15-room-planner.jpg) | ![Size and floor](docs/screenshots/16-room-planner-size-floor.jpg) |
| **Furniture with live estimate** | |
| ![Furniture](docs/screenshots/17-room-planner-furniture.jpg) | |

### Designers, checkout and orders

| Designers | Designer profile |
|---|---|
| ![Designers](docs/screenshots/18-designers.jpg) | ![Designer profile](docs/screenshots/19-designer-profile.jpg) |
| **Checkout** | **Orders** |
| ![Checkout](docs/screenshots/20-checkout.jpg) | ![Orders](docs/screenshots/21-orders.jpg) |

### Phone

| Home | Catalog | Product |
|---|---|---|
| ![Mobile home](docs/screenshots/22-mobile-landing.jpg) | ![Mobile catalog](docs/screenshots/23-mobile-catalog.jpg) | ![Mobile product](docs/screenshots/24-mobile-product.jpg) |

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 8, Tailwind CSS 3.4, Framer Motion 12, React Icons |
| **Backend** | Java 21, Spring Boot 3.5 (Web, Data JPA, Validation, Security, OAuth2 Resource Server) |
| **Authentication** | Stateless JWT (HS256) issued and verified with Nimbus; passwords hashed with BCrypt |
| **Database** | PostgreSQL with Flyway migrations (schema and seed data); Hibernate validates against it |
| **Testing** | JUnit 5, Spring Boot Test, MockMvc (97 tests) |
| **Tooling** | Maven Wrapper, npm, ESLint |

## Design patterns

Seven Gang of Four patterns, each solving a real problem in the app. Every pattern lives in its own package under `backend/src/main/java/com/palette/palette/patterns`. [docs/DESIGN_PATTERNS.md](docs/DESIGN_PATTERNS.md) walks through the roles, the code and the tests for each one.

| # | Pattern | Type | Where | What it does in Palette |
|---|---|---|---|---|
| 1 | **Composite** | Structural | `patterns/composite` | Products, bundles and custom rooms share one `InventoryItem` interface, so the cart prices them all the same way. |
| 2 | **Builder** | Creational | `patterns/builder` | `RoomBuilder` assembles a custom room step by step: size, floor, wallpaper, furniture. |
| 3 | **Strategy** | Behavioural | `patterns/strategy` | Picks how each product is priced in a room: per item, per square foot of floor or per square foot of wall. |
| 4 | **Factory Method** | Creational | `patterns/factory` | Each style has its own bundle factory, used by the style quiz to build a curated bundle. |
| 5 | **Null Object** | Behavioural | `patterns/nullobject` | `NoStyleBundle` stands in when there is no recommendation, so callers never handle `null`. |
| 6 | **Adapter** | Structural | `patterns/adapter` | Lets the app pay in rupees through gateways that expect US cents (Stripe) or paisa (JazzCash). |
| 7 | **Singleton** | Creational | `patterns/singleton` | One `PaymentManager` instance handles every charge, shared by Spring and plain Java code. |

## Architecture

```mermaid
flowchart LR
    subgraph Browser["React frontend (Vite)"]
        Pages["Pages<br/>catalog, planner, quiz, checkout"]
        State["Auth, cart and currency context"]
        Client["api/client.js<br/>adds the JWT, turns errors into messages"]
        Pages --> State --> Client
    end

    subgraph Server["Spring Boot backend"]
        Security["Security filter<br/>verifies the JWT"]
        Controllers["REST controllers"]
        Services["Services<br/>cart, orders, rooms, quiz, payments"]
        Patterns["Design patterns<br/>composite, builder, strategy,<br/>factory, null object, adapter, singleton"]
        Repos["JPA repositories"]
        Security --> Controllers --> Services --> Patterns
        Services --> Repos
    end

    DB[("PostgreSQL<br/>Flyway migrations")]

    Client -- "JSON over HTTP" --> Security
    Repos --> DB
```

- **The server is the source of truth for money.** The browser sends product ids, never prices. Room totals, cart totals and the amount charged are all computed on the server.
- **The user always comes from the token.** Endpoints never trust a user id sent in the request; the authenticated user is resolved from the JWT.
- **Flyway owns the schema.** Migrations create the tables and seed the catalog. Hibernate only checks that the entities match.

## Getting started

### Prerequisites

- Java 21
- Node.js 20.19 or newer
- PostgreSQL 14 or newer

### 1. Create the database

```bash
createdb -U postgres palette
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set your own database password and a JWT secret of at least 32 characters. To generate a secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

`backend/.env` is git-ignored, so your values stay on your machine.

### 3. Run the backend

```bash
# macOS / Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

The API starts on `http://localhost:8081`. On first start, Flyway creates the schema and seeds 122 products, 6 designers and the three styles.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and create an account to start shopping.

## Configuration

The backend reads these environment variables, or the same keys from `backend/.env`.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DB_URL` | No | `jdbc:postgresql://localhost:5432/palette` | JDBC connection string |
| `DB_USERNAME` | No | `postgres` | Database user |
| `DB_PASSWORD` | **Yes** | none | Database password |
| `JWT_SECRET` | **Yes** | none | Key used to sign login tokens, at least 32 characters |
| `JWT_LIFETIME` | No | `PT24H` | How long a login token lasts (ISO-8601 duration) |
| `PORT` | No | `8081` | API port |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated frontend origins allowed to call the API |
| `SHOW_SQL` | No | `false` | Log generated SQL while debugging |

The frontend reads one optional variable, `VITE_API_BASE_URL` (default `http://localhost:8081`).

## API reference

Every endpoint is under `/api`. **Public** endpoints need no login; the rest need an `Authorization: Bearer <token>` header.

| Area | Method and path | Access |
|---|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login` | Public |
| **Products** | `GET /products`, `/products/{id}`, `/products/search?keyword=`, `/products/category/{category}`, `/products/filter`, `/products/standalone` | Public |
| **Bundles** | `GET /products/bundles`, `/products/bundles/{id}`, `/products/bundles/room/{roomType}`, `/products/bundles/filter` | Public |
| **Designers** | `GET /designers`, `GET /designers/{id}` | Public |
| **Style quiz** | `POST /design-quiz/submit` (saved to your profile when signed in) | Public |
| | `GET /design-quiz/latest` | Signed in |
| **Cart** | `GET /cart`, `POST /cart/add`, `DELETE /cart/remove/{cartItemId}`, `DELETE /cart/clear` | Signed in |
| **Room planner** | `GET /room-builder/products/{roomType}` | Public |
| | `POST /room-builder/build`, `GET /room-builder`, `GET /room-builder/{roomId}`, `DELETE /room-builder/{roomId}`, `POST /room-builder/{roomId}/add-to-cart` | Signed in |
| **Orders** | `POST /order/create` (turns your cart into an order), `GET /order`, `GET /order/{orderId}` | Signed in |
| **Payments** | `POST /payment/process`, `GET /payment/order/{orderId}` | Signed in |
| | `GET /payment/health` | Public |

## Security

- **No secrets in the repository.** Database credentials and the JWT secret come from environment variables or the git-ignored `backend/.env`. Only `backend/.env.example`, with placeholder values, is committed.
- **Stateless JWT authentication** with HS256 tokens that expire after 24 hours by default. An invalid or expired token signs the user out in the browser.
- **BCrypt password hashing**, and the same error message for a wrong password and an unknown email, so accounts can't be discovered by trial.
- **Server-side pricing.** The amount charged is always the order's own total, whatever the client sends.
- **Ownership checks.** Users can only read and change their own cart, rooms, orders and payments.
- **CORS** is limited to the configured frontend origins.

## Testing

```bash
# Backend: 97 unit and integration tests (needs the database from Getting started)
cd backend
./mvnw test

# Frontend: lint and a production build
cd frontend
npm run lint
npm run build
```

The backend tests cover each design pattern, the seed data, the checkout flow, room and quiz services, and the API's security rules.

## Design system

The interface uses one set of design tokens, defined in `frontend/src/style.css` and mapped to Tailwind in `frontend/tailwind.config.js`.

| Token | Colour | Used for |
|---|---|---|
| Terracotta | `#C4522A` | Actions and selected states |
| Sand | `#F0E6D8` | Page header bands |
| Sage | `#627054` | Product band, design tips, Scandinavian items |
| Walnut | `#38241C` | Dark sections and the footer |
| Ink | `#1B1714` | Text |

- **Type:** Merriweather Medium for headings and the logo, Inter for everything else.
- **Images:** product photos keep their own proportions. Photos close to the frame's shape fill it, while cut-outs and unusually wide or tall images are shown whole, so furniture is never cropped.
- **Motion:** short, critically damped springs. The interface respects the operating system's reduced-motion setting.
- **Layouts:** responsive from 360px phones to wide desktops.

## Project structure

```
palette-sda-project/
├── backend/
│   ├── src/main/java/com/palette/palette/
│   │   ├── config/         CORS, web configuration
│   │   ├── controller/     REST controllers
│   │   ├── dto/            request and response objects
│   │   ├── entities/       JPA entities
│   │   ├── exceptions/     domain errors and the global error handler
│   │   ├── patterns/       the seven design patterns, one package each
│   │   ├── repository/     Spring Data repositories
│   │   ├── security/       JWT setup and current-user resolution
│   │   └── services/       business logic
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/   Flyway schema (V1) and seed data (V2)
│   ├── src/test/           JUnit and MockMvc tests
│   └── .env.example        template for local secrets
├── frontend/
│   ├── public/products/    product photography
│   └── src/
│       ├── api/            API client and endpoint functions
│       ├── auth/           session and auth context
│       ├── components/     layout, UI kit, cart, product card
│       ├── lib/            cart and currency context, labels, money and room helpers
│       └── pages/          one file per route
└── docs/
    ├── DESIGN_PATTERNS.md  pattern-by-pattern walkthrough
    └── screenshots/        images used in this README
```

---

<div align="center">
Built for the Software Design & Architecture course.
</div>
