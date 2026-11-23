# 🎨 PALETTE SDA PROJECT — COMPLETE ARCHITECTURE & ENGINEERING GUIDE

> **Author**: Senior Software Engineering Review & Architecture Team  
> **Project**: Palette SDA (Interior Design & Furniture E-Commerce Platform)  
> **Version**: 2.0  
> **Last Updated**: 2026-09-01  
> **Tech Stack**: Spring Boot 3.5.14 (Java 21) · PostgreSQL · React 19 (Vite 8) · Tailwind CSS · Framer Motion  

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [Software Design Patterns Deep-Dive](#2-software-design-patterns-deep-dive)
3. [Backend Architecture & Complete Code Catalog](#3-backend-architecture--complete-code-catalog)
4. [Frontend Architecture, Rendering Guide & Component Catalog](#4-frontend-architecture-rendering-guide--component-catalog)
5. [Database ER Model & Entity Relationships](#5-database-er-model--entity-relationships)
6. [API Endpoints Reference & Request/Response Contracts](#6-api-endpoints-reference--requestresponse-contracts)
7. [Dead Code, Unused Files & Redundant Assets](#7-dead-code-unused-files--redundant-assets)
8. [Pattern Inconsistencies & Code Smells](#8-pattern-inconsistencies--code-smells)
9. [Security Audit: Leaked Secrets, Hardcoded Credentials & Config Issues](#9-security-audit-leaked-secrets-hardcoded-credentials--config-issues)
10. [Critical Logic Bugs, Off-By-Ones & State Handling Flaws](#10-critical-logic-bugs-off-by-ones--state-handling-flaws)
11. [Unfinished, Placeholder & Stubbed Features](#11-unfinished-placeholder--stubbed-features)
12. [Complete Inventory of TODO, FIXME & HACK Comments](#12-complete-inventory-of-todo-fixme--hack-comments)
13. [Senior Engineer Remediation Roadmap](#13-senior-engineer-remediation-roadmap)

---

## 1. EXECUTIVE SUMMARY & HIGH-LEVEL ARCHITECTURE

### 1.1 What is Palette?
**Palette** is a full-stack digital interior design studio and e-commerce platform. It enables homeowners and designers to:
- Browse curated furniture catalogs filtered by room, category, and aesthetic style.
- Take an interactive **Design Quiz** to receive algorithmic room styling recommendations and bundles with bundle discounts.
- Build customized rooms using a step-by-step **Custom Room Builder** (specifying dimensions, flooring, wallpaper, and furniture).
- Hire and consult with verified **Interior Designers** based on aesthetic specialties and hourly rates.
- Manage shopping carts, execute multi-item checkout, and simulate multi-gateway payments (**Stripe** for USD/international and **JazzCash** for PKR/local).

### 1.2 System Architecture Diagram
```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER (Browser)                             │
│  React 19 + Vite 8 + React Router 7 + Framer Motion + Tailwind CSS + Styled Comp  │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │ HTTP REST (JSON) / Port 8081
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / SECURITY LAYER                            │
│           SecurityConfig (Stateless Filter Chain) + CorsConfig (Port 5173)        │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼──────────────────────────────────────────┐
│                             CONTROLLER LAYER (Spring MVC)                         │
│  AuthController │ ProductController │ CartController │ OrderController           │
│  PaymentController │ RoomBuilderController │ DesignQuizController │ DesignerCtrl   │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │ DTOs
┌────────────────────────────────────────▼──────────────────────────────────────────┐
│                              SERVICE LAYER (Business Logic)                       │
│  AuthService │ ECommerceService │ CartManager │ OrderService │ PaymentService      │
│  RoomBuilderService │ DesignQuizService │ DesignerService                        │
└───────┬───────────────────────────────┬───────────────────────────────┬───────────┘
        │                               │                               │
┌───────▼────────────────┐   ┌──────────▼────────────────┐   ┌──────────▼───────────┐
│   DESIGN PATTERNS      │   │     DATA ACCESS LAYER     │   │   DATABASE LAYER     │
│ • Factory (Bundles)    │   │ Spring Data JPA           │   │ PostgreSQL (5432)    │
│ • Builder (Rooms)      │   │ 11 Repositories           │   │ Tables: users, carts,│
│ • Composite (Inventory)│   │ Hibernate DDL update      │   │ products, orders,    │
│• Null Object(Fallbacks)│   │                           │   │ payments, custom_rms │
│ • Adapter (Gateways)   │   │                           │   │                      │
│ • Singleton (Managers) │   │                           │   │                      │
└────────────────────────┘   └───────────────────────────┘   └──────────────────────┘
```

---

## 2. SOFTWARE DESIGN PATTERNS DEEP-DIVE

The Palette backend was specifically architected to demonstrate core Gang of Four (GoF) software design patterns. Here is how each pattern is realized in code:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DESIGN PATTERN REGISTRY                                  │
├───────────────────┬───────────────────────────────────────────────┬──────────────────────┤
│ Pattern           │ Implementation Location                       │ Real-World Purpose   │
├───────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ 1. Composite      │ patterns/composite/InventoryItem.java         │ Treats single items, │
│                   │ entities/Product.java                         │ bundles, & custom    │
│                   │ entities/FurnitureBundle.java                 │ rooms uniformly in   │
│                   │ entities/CustomRoom.java                      │ cart & checkout.     │
├───────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ 2. Builder        │ patterns/builder/RoomBuilder.java             │ Step-by-step room    │
│                   │ services/RoomBuilderService.java              │ construction with    │
│                   │                                               │ dimension & pricing. │
├───────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ 3. Factory        │ patterns/factory/AestheticBundleFactory.java  │ Generates style-based│
│                   │ patterns/factory/StyleBundle.java             │ curated room bundles │
│                   │                                               │ with discounts.      │
├───────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ 4. Null Object    │ patterns/nullobject/NoStyleBundle.java        │ Graceful fallback for│
│                   │ frontend/src/pages/PaymentPage.jsx            │ invalid quiz choices │
│                   │                                               │ or failed payments.  │
├───────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ 5. Adapter        │ patterns/adapter/LocalPaymentProcessor.java   │ Standardizes Stripe  │
│                   │ patterns/adapter/StripeAdapter.java           │ (USD/cents) and      │
│                   │ patterns/adapter/JazzCashAdapter.java         │ JazzCash (paisa).    │
├───────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ 6. Singleton      │ patterns/singleton/PaymentManager.java        │ Single synchronized  │
│                   │ services/CartManager.java                     │ entry point for      │
│                   │                                               │ transactions/sessions│
└───────────────────┴───────────────────────────────────────────────┴──────────────────────┘
```

### 2.1 Composite Pattern (Inventory & Cart Management)
- **Interface**: [`InventoryItem`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/composite/InventoryItem.java)
  - `Long getId()`
  - `String getName()`
  - `double getPrice()`
- **Leaf**: [`Product`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/entities/Product.java) — Individual product with standalone price.
- **Composite 1**: [`FurnitureBundle`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/entities/FurnitureBundle.java) — Aggregates multiple `Product` leaves, calculates composite raw sum, and applies a `discountFactor` (e.g. 5% or 8% off).
- **Composite 2**: [`CustomRoom`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/entities/CustomRoom.java) — Aggregates dimensional flooring, wall surface areas, and selected furniture items to produce a unified price.
- **Client**: [`CartManager.getCartSummary()`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/CartManager.java) evaluates cart lines polymorphically through `InventoryItem` without needing separate price calculation loops for each item type.

### 2.2 Builder Pattern (Custom Room Construction)
- **Builder Class**: [`RoomBuilder`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/builder/RoomBuilder.java)
- **Target Entity**: [`CustomRoom`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/entities/CustomRoom.java)
- **Workflow**:
  1. Mandatory initialization: `new RoomBuilder(roomType, width, length)` (validates bounds $1 \le \text{dimension} \le 100$).
  2. Optional chained configuration: `.setFlooring(flooring)`, `.setWallpaper(wallpaper)`.
  3. Incremental population: `.addFurniture(item)` (can be called repeatedly).
  4. Price binding: `.setTotalPrice(calculatedPrice)`.
  5. Terminal build: `.build()` (enforces at least 1 furniture item and initializes DB status flags).

### 2.3 Factory Method Pattern (Aesthetic Furniture Bundles)
- **Factory**: [`AestheticBundleFactory`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/factory/AestheticBundleFactory.java)
- **Product Object**: [`StyleBundle`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/factory/StyleBundle.java)
- **Supported Styles**: `BOHEMIAN` (5% discount), `SCANDINAVIAN` (8% discount), `MINIMALIST` (0% discount).
- **Supported Rooms**: `BEDROOM`, `LIVING_ROOM`, `KITCHEN`, `DINING_ROOM`.

### 2.4 Null Object Pattern (Resilient Fallbacks)
- **Backend**: [`NoStyleBundle`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/nullobject/NoStyleBundle.java) extends `StyleBundle`. When unrecognized style/room combinations or errors occur during quiz submission, the controller returns a default object with empty product lists, $1.0$ discount factor, and a helpful error message instead of throwing an unhandled null pointer exception or 500 error.
- **Frontend**: [`NullPaymentResult`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/PaymentPage.jsx#L28-L36) in `PaymentPage.jsx`. On payment failures, state resolves to a structured non-null object with `isNull: true`, allowing the UI to render the result screen seamlessly without null reference crashes.

### 2.5 Adapter Pattern (Multi-Gateway Payment Processing)
- **Target Interface**: [`LocalPaymentProcessor`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/adapter/LocalPaymentProcessor.java) (`payInPKR(double amount)`, `getGatewayType()`).
- **Stripe Adapter**: [`StripeAdapter`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/adapter/StripeAdapter.java) converts PKR $\to$ USD ($\div 280.0$) $\to$ integer Cents ($\times 100$), then invokes `StripeSDK.chargeInCents()`.
- **JazzCash Adapter**: [`JazzCashAdapter`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/adapter/JazzCashAdapter.java) converts PKR $\to$ Paisa ($\times 100$), then invokes `JazzCashSDK.chargeInPaisa()`.

### 2.6 Singleton Pattern (Session & Payment Orchestration)
- [`PaymentManager`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/patterns/singleton/PaymentManager.java): Provides double-checked locking lazy initialization `getInstance()` to manage payment routing.
- [`CartManager`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/CartManager.java): Maintains an in-memory `ConcurrentHashMap<Long, Cart> activeCartSessions` for fast cached cart lookups per user.

---

## 3. BACKEND ARCHITECTURE & COMPLETE CODE CATALOG

### 3.1 Directory Structure
```
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/palette/palette/
    │   │   ├── PaletteApplication.java
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java
    │   │   │   └── SecurityConfig.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── CartController.java
    │   │   │   ├── DesignerController.java
    │   │   │   ├── DesignQuizController.java
    │   │   │   ├── OrderController.java
    │   │   │   ├── PaymentController.java
    │   │   │   ├── ProductController.java
    │   │   │   └── RoomBuilderController.java
    │   │   ├── dto/
    │   │   │   ├── AuthResponseDTO.java
    │   │   │   ├── CartItemRequestDTO.java
    │   │   │   ├── CartResponseDTO.java
    │   │   │   ├── CustomRoomResponseDTO.java
    │   │   │   ├── DesignerDTO.java
    │   │   │   ├── DesignQuizRequestDTO.java
    │   │   │   ├── DesignQuizResponseDTO.java
    │   │   │   ├── LoginRequestDTO.java
    │   │   │   ├── OrderRequestDTO.java
    │   │   │   ├── OrderResponseDTO.java
    │   │   │   ├── PaymentRequestDTO.java
    │   │   │   ├── PaymentResponseDTO.java
    │   │   │   ├── ProductDTO.java
    │   │   │   ├── RegisterRequestDTO.java
    │   │   │   └── RoomBuilderRequestDTO.java
    │   │   ├── entities/
    │   │   │   ├── AestheticStyle.java
    │   │   │   ├── Cart.java
    │   │   │   ├── CartItem.java
    │   │   │   ├── CustomRoom.java
    │   │   │   ├── Designer.java
    │   │   │   ├── DesignQuiz.java
    │   │   │   ├── FurnitureBundle.java
    │   │   │   ├── Order.java
    │   │   │   ├── OrderItem.java
    │   │   │   ├── Payment.java
    │   │   │   ├── Product.java
    │   │   │   └── User.java
    │   │   ├── exceptions/
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── patterns/
    │   │   │   ├── adapter/
    │   │   │   │   ├── JazzCashAdapter.java
    │   │   │   │   ├── LocalPaymentProcessor.java
    │   │   │   │   └── StripeAdapter.java
    │   │   │   ├── builder/
    │   │   │   │   └── RoomBuilder.java
    │   │   │   ├── composite/
    │   │   │   │   └── InventoryItem.java
    │   │   │   ├── factory/
    │   │   │   │   ├── AestheticBundleFactory.java
    │   │   │   │   └── StyleBundle.java
    │   │   │   ├── nullobject/
    │   │   │   │   └── NoStyleBundle.java
    │   │   │   └── singleton/
    │   │   │       └── PaymentManager.java
    │   │   ├── repository/
    │   │   │   ├── CartItemRepository.java
    │   │   │   ├── CartRepository.java
    │   │   │   ├── CustomRoomRepository.java
    │   │   │   ├── DesignerRepository.java
    │   │   │   ├── DesignQuizRepository.java
    │   │   │   ├── FurnitureBundleRepository.java
    │   │   │   ├── OrderItemRepository.java
    │   │   │   ├── OrderRepository.java
    │   │   │   ├── PaymentRepository.java
    │   │   │   ├── ProductRepository.java
    │   │   │   └── UserRepository.java
    │   │   └── services/
    │   │       ├── AuthService.java
    │   │       ├── CartManager.java
    │   │       ├── DesignerService.java
    │   │       ├── DesignQuizService.java
    │   │       ├── ECommerceService.java
    │   │       ├── OrderService.java
    │   │       ├── PaymentService.java
    │   │       └── RoomBuilderService.java
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/palette/palette/
            └── PaletteApplicationTests.java
```

### 3.2 Backend File-by-File Catalog

#### Configuration
- [`CorsConfig.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/config/CorsConfig.java): Implements `WebMvcConfigurer` to register global CORS allowances for `http://localhost:5173`, `http://localhost:5174`, and `http://localhost:3000` supporting `GET, POST, PUT, DELETE, OPTIONS`.
- [`SecurityConfig.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/config/SecurityConfig.java): Configures `BCryptPasswordEncoder(12)` and stateless security filter chain with CSRF disabled and public endpoints for development.

#### Controllers
- [`AuthController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/AuthController.java):
  - `register(@Valid @RequestBody RegisterRequestDTO)`: Handles user signup, hashes password, provisions empty cart. Returns `AuthResponseDTO` (201 Created).
  - `login(@Valid @RequestBody LoginRequestDTO)`: Verifies BCrypt password hash and authenticates user. Returns `AuthResponseDTO` (200 OK).
- [`ProductController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/ProductController.java):
  - `getAllProducts()`: Returns complete product catalog list.
  - `getProductById(Long id)`: Returns individual product details.
  - `getByCategory(String category)`: Returns products matching `ProductCategory` enum.
  - `searchProducts(String keyword)`: Case-insensitive search on product names.
  - `filterByMaxPrice(Double maxPrice)`: Products priced $\le$ `maxPrice`.
  - `getStandaloneProducts()`: Products without an assigned furniture bundle.
  - `getAllBundles()`, `getBundleById()`, `getBundlesByRoomType()`, `getBundlesByMaxPrice()`: Bundles endpoints.
- [`CartController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/CartController.java):
  - `addItemToCart(Long userId, CartItemRequestDTO)`: Adds product, bundle, or custom room to cart.
  - `getCart(Long userId)`: Returns aggregated cart summary with calculated grand total.
  - `removeItem(Long cartItemId, Long userId)`: Deletes individual cart item.
  - `clearCart(Long userId)`: Removes all items from user's cart.
- [`OrderController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/OrderController.java):
  - `createOrder(OrderRequestDTO)`: Finalizes cart into order, snapshots line items, clears cart.
  - `getOrdersByUserId(Long userId)`: Retrieves user order history.
  - `getOrder(Long orderId, Long userId)`: Retrieves single order with user verification.
  - `updateOrderStatus(Long orderId, String newStatus)`: Updates state (e.g. `CONFIRMED`, `SHIPPED`).
- [`PaymentController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/PaymentController.java):
  - `processPayment(PaymentRequestDTO)`: Charges order via specified gateway adapter.
  - `getPaymentById(Long id)`: Fetches payment record.
  - `getPaymentByTransactionId(String txId)`: Fetches payment by gateway transaction ID.
  - `getPaymentByOrderId(Long orderId)`: Fetches payment attached to an order.
  - `healthCheck()`: Verifies payment gateway adapters.
- [`RoomBuilderController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/RoomBuilderController.java):
  - `buildRoom(Long userId, RoomBuilderRequestDTO)`: Compiles custom room via Builder pattern.
  - `getRoomById(Long roomId, Long userId)`: Fetches user-owned room.
  - `getUserRooms(Long userId)`: Lists all saved custom rooms for a user.
  - `updateRoom(Long roomId, Long userId, RoomBuilderRequestDTO)`: Reconstructs an existing room.
  - `deleteRoom(Long roomId, Long userId)`: Deletes room.
  - `addToCart(Long roomId, Long userId, Map<String, Integer>)`: Converts custom room into cart line item.
  - `getProductsByRoomType(String roomType)`: Returns all furniture/finishes matching room type.
- [`DesignQuizController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/DesignQuizController.java):
  - `submitQuiz(DesignQuizRequestDTO, Long userId)`: Evaluates quiz answers, invokes `AestheticBundleFactory`, returns style recommendations and discount bundles.
- [`DesignerController.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/controller/DesignerController.java):
  - `getAllDesigners()`: Returns list of interior designers with preferred aesthetic styles.
  - `getDesignerById(Long id)`: Returns individual designer profile.

#### Services
- [`AuthService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/AuthService.java): Coordinates authentication, duplicate email checks, BCrypt encoding, and initial Cart entity creation.
- [`CartManager.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/CartManager.java): Core session and shopping cart manager. Handles polymorphic item addition (`PRODUCT`, `BUNDLE`, `CUSTOM_ROOM`), quantity increments, and total calculations via `InventoryItem`.
- [`ECommerceService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/ECommerceService.java): Queries products and bundles by category, room type, keyword, and max price.
- [`OrderService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/OrderService.java): Converts active cart into immutable `Order` and `OrderItem` historical snapshots. Clears cart upon order creation.
- [`PaymentService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/PaymentService.java): Manages payment transactions. Separates success and failure persistence into independent `Propagation.REQUIRES_NEW` transactions so that failure logging never rolls back.
- [`RoomBuilderService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/RoomBuilderService.java): Calculates dynamic surface area pricing (dimensions $\times$ unit price of flooring/wallpaper) + furniture item prices, executes `RoomBuilder.build()`, and persists the custom room.
- [`DesignQuizService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/DesignQuizService.java): Integrates `AestheticBundleFactory`, filters database products matching recommended IDs, applies bundle discounts, and records quiz history for logged-in users.
- [`DesignerService.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/services/DesignerService.java): Fetches designer records and maps entity attributes and style names into `DesignerDTO`.

---

## 4. FRONTEND ARCHITECTURE, RENDERING GUIDE & COMPONENT CATALOG

### 4.1 Frontend Routing Table (`App.jsx`)
```
┌─────────────────────────┬──────────────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ Route Path              │ Component Rendered   │ Auth Status │ Purpose & Description                                  │
├─────────────────────────┼──────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ /                       │ LandingPage.jsx      │ Public      │ Hero, philosophy, style quiz teaser, before/after      │
│                         │                      │             │ slider, reviews carousel, studio contact footer.       │
│ /login                  │ Login.jsx            │ Public      │ User login with email/password and validation.         │
│ /register               │ Register.jsx         │ Public      │ User registration with currency preference setting.    │
│ /dashboard              │ Dashboard.jsx        │ Protected   │ Hub with currency switch, room bundles, tips, blog.   │
│ /catalog                │ ProductCatalog.jsx   │ Protected   │ Full catalog with search, category pills, price caps,   │
│                         │                      │             │ room filters, style filters, and sliding cart drawer.  │
│ /quiz                   │ DesignQuiz.jsx       │ Protected   │ 4-question weighted aesthetic quiz & bundle results.   │
│ /designers              │ Designers.jsx        │ Protected   │ Designer gallery with style/budget filters & modal.    │
│ /room-builder           │ RoomBuilder.jsx      │ Protected   │ 6-step interactive custom room wizard with preview.   │
│ /payment                │ PaymentPage.jsx      │ Protected   │ Order confirmation, gateway picker, simulated payment. │
│ /orders                 │ Orders.jsx           │ Protected   │ Order history with status badges & line items.         │
│ /cart-checkout          │ CartCheckoutFlow.jsx │ Protected   │ Alternate standalone checkout flow (mocked user).      │
│ /product/:id            │ ProductDetails.jsx   │ Protected   │ Single product detail view with Add to Cart action.    │
│ /flooring-wallpaper     │ ProductCatalog.jsx   │ Protected   │ Filtered catalog preset specifically for FLOORING.     │
│ *                       │ Navigate to "/"      │ Public      │ Wildcard fallback redirecting to home.                 │
└─────────────────────────┴──────────────────────┴─────────────┴────────────────────────────────────────────────────────┘
```

### 4.2 Frontend Visual Rendering Map (Where Everything is Rendered)

#### 1. Landing Page (`LandingPage.jsx`)
- **Top Navigation Bar**: Fixed header with brand logo, direct anchors (`#styles`, `#designers`, `#experience`), and authentication CTA buttons ("Sign In" $\to$ `/login`, "Join Studio" $\to$ `/register`).
- **Hero Section**: Large typography, ambient radial glow, Call-to-Action to take the Style Quiz or build a custom room.
- **Three Aesthetic Cards Section**: Interactive cards for *Scandinavian*, *Bohemian*, and *Minimalist* styles with visual match percentages and color tokens.
- **Designer Vignettes**: Stacked rotating polaroid cards displaying Aisha K., Marco D., and Farah I. with quotes.
- **Before / After Interactive Slider**: Renders [`BeforeAfterSlider.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/components/BeforeAfterSlider.jsx) with draggable split divider comparing dull before rooms with decorated Palette rooms.
- **Client Reviews Carousel**: Renders [`Reviewscarousel.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/components/Reviewscarousel.jsx) with smooth continuous auto-scrolling testimonial cards.
- **Studio Footer**: Editorial layout with newsletter signup, social links, and contact information.

#### 2. Dashboard (`Dashboard.jsx`)
- **Global Header**: Sticky blur navigation with links to Catalog, Designers, Quiz, Room Builder, Flooring, real-time Cart counter button, user profile greeting, and Logout.
- **Currency Switcher**: Dropdown supporting `PKR` and `USD` that controls global price formatting across the session.
- **Curated Room Bundles Grid**: 4 interactive cards (*Bedroom*, *Living Room*, *Kitchen*, *Dining Room*). Clicking any card navigates to `/catalog` pre-filtered by that room.
- **Design Principles & Tips**: Expandable accordions with 10 architectural guidelines (e.g. 60-30-10 rule, lighting layers, negative space).
- **Design Journal / Blog**: Embedded [`BlogSection.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/components/BlogSection.jsx) displaying styling articles and modal article reader.

#### 3. Product Catalog & Cart Drawer (`ProductCatalog.jsx`)
- **Filter Bar**:
  - Live text search input with 400ms debounce.
  - Category horizontal pill carousel (`ALL`, `BED`, `CHAIR`, `TABLE`, `LAMP`, `RUG`, `WARDROBE`, `SOFA`, `FLOORING`, `WALLPAPER`, `DECOR`).
  - Dropdown selectors for *Room Type*, *Aesthetic Style*, and *Max Price Cap*.
- **Product Grid**: Responsive card grid. Each card displays product image, category tag, room badge, name, description, price (formatted in active currency), and animated "Add to Cart" button.
- **Sliding Cart Drawer**: Slides in from right when clicking Cart. Displays line items, quantity, item type badge (`PRODUCT`, `BUNDLE`, `CUSTOM_ROOM`), unit price, sub-item pills, and a "Proceed to Checkout" button navigating to `/payment`.

#### 4. Design Quiz Wizard (`DesignQuiz.jsx`)
- **Step 1: 4 Weighted Questions**:
  1. *Colour Palette* (Warm terracottas vs crisp whites vs cool greys vs jewel tones).
  2. *Textures & Materials* (Layered rugs vs pale wood vs concrete vs velvet).
  3. *Room Mood* (Adventurous vs cosy vs calm vs energetic).
  4. *Inspiration* (Marrakech souk vs Nordic cabin vs Tokyo loft vs artist studio).
- **Step 2: Room Selection**: Choose target room (*Bedroom*, *Living Room*, *Kitchen*, *Dining Room*, *Game Room*, *Office*).
- **Step 3: Algorithmic Recommendation Screen**: Calculates dominant aesthetic style, fires confetti animation, displays calculated bundle price with discount percentage, and renders individual recommended furniture cards with 1-click Add to Cart actions.

#### 5. Custom Room Builder Wizard (`RoomBuilder.jsx`)
- **Step 1 (Room Type)**: Select room category with poetic visual cards.
- **Step 2 (Dimensions)**: Sliders for Width ($10\text{ft} - 30\text{ft}$) and Length ($10\text{ft} - 30\text{ft}$) with real-time floor square footage calculator.
- **Step 3 (Flooring & Wallpaper)**: Visual material cards (*Warm Hardwood*, *Matte Porcelain*, *Soft Wool Carpet*, *Micro Cement*, *Natural Stone*) with unit prices per square foot.
- **Step 4 (Furniture Selection)**: Live catalog query fetching products for the room. Users check items to include in their custom bundle.
- **Step 5 (Review & Pricing)**: Complete bill of materials showing dimensional breakdown, finishes, furniture items, and grand total.
- **Step 6 (Done / Actions)**: "Add to Cart" and "Proceed to Payment" options.

#### 6. Payment & Order Confirmation (`PaymentPage.jsx`)
- **Screen 1 (Order Creation)**: Automatically converts pending cart into order via `/api/order/create`.
- **Screen 2 (Gateway Selection)**: Interactive payment cards for **Stripe** (International / Cards) and **JazzCash** (Local / Mobile Wallet).
- **Screen 3 (Processing)**: Animated spinner simulating secure gateway transaction.
- **Screen 4 (Confirmation)**:
  - *Success*: Renders [`OrderSuccessCard.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/components/OrderSuccessCard.jsx) with transaction ID, amount in PKR & USD, and links to Track Package or View Order History.
  - *Failure*: Uses `NullPaymentResult` to display specific failure reason with a "Try Again" option.

---

## 5. DATABASE ER MODEL & ENTITY RELATIONSHIPS

```
┌─────────────────────────┐         1:1         ┌─────────────────────────┐
│          USERS          ├─────────────────────┤          CARTS          │
│-------------------------│                     │-------------------------│
│ id (PK)                 │                     │ id (PK)                 │
│ email (UQ)              │                     │ user_id (FK, UQ)        │
│ full_name               │                     └────────────┬────────────┘
│ password_hash           │                                  │ 1:N
│ currency_preference     │                                  ▼
└───────────┬─────────────┘                     ┌─────────────────────────┐
            │ 1:N                               │       CART_ITEMS        │
            ▼                                   │-------------------------│
┌─────────────────────────┐                     │ id (PK)                 │
│         ORDERS          │                     │ cart_id (FK)            │
│-------------------------│                     │ item_type (ENUM)        │
│ id (PK)                 │                     │ product_id (FK, Nullable)
│ user_id (FK)            │                     │ bundle_id (FK, Nullable)│
│ status (ENUM)           │                     │ custom_room_id (FK, Null)
│ total_amountpkr         │                     │ quantity, unit_price    │
│ created_at              │                     └─────────────────────────┘
└───────────┬─────────────┘
            │ 1:1
            ├───────────────────────────────────┐
            ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│        PAYMENTS         │         │       ORDER_ITEMS       │
│-------------------------│         │-------------------------│
│ id (PK)                 │         │ id (PK)                 │
│ order_id (FK, UQ)       │         │ order_id (FK)           │
│ gateway (ENUM)          │         │ item_type (ENUM)        │
│ status (ENUM)           │         │ item_name, quantity     │
│ amountpkr / amount_inpkr│         │ unit_price, line_total  │
│ amountusd / amount_inusd│         └─────────────────────────┘
│ transaction_id          │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐         1:N         ┌─────────────────────────┐
│    AESTHETIC_STYLES     ├─────────────────────┤    FURNITURE_BUNDLES    │
│-------------------------│                     │-------------------------│
│ id (PK)                 │                     │ id (PK)                 │
│ name (UQ)               │                     │ name, description       │
│ description             │                     │ room_type (ENUM)        │
└───────────┬─────────────┘                     │ style_id (FK)           │
            │ 1:N                               │ discount_factor         │
            ▼                                   │ total_price_inpkr       │
┌─────────────────────────┐                     └────────────┬────────────┘
│        DESIGNERS        │                                  │ 1:N
│-------------------------│                                  ▼
│ id (PK)                 │                     ┌─────────────────────────┐
│ name, email (UQ), bio   │                     │        PRODUCTS         │
│ portfolio_url           │                     │-------------------------│
│ hourly_rate_pkr         │                     │ id (PK)                 │
│ specialty               │                     │ name, description       │
│ preferred_style_id (FK) │                     │ price_in_pkr, image_url │
└─────────────────────────┘                     │ category (ENUM)         │
                                                │ room_type (ENUM)        │
                                                │ aesthetic_style (ENUM)  │
                                                │ bundle_id (FK, Nullable)│
                                                └─────────────────────────┘
```

---

## 6. API ENDPOINTS REFERENCE & REQUEST/RESPONSE CONTRACTS

| Method | Endpoint | Query / Path Params | Request Body | Response Status & Key Fields |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | — | `{ fullName, email, password, currencyPreference }` | `201 Created`: `{ userId, email, fullName, currencyPreference }` |
| `POST` | `/api/auth/login` | — | `{ email, password }` | `200 OK`: `{ userId, email, fullName, currencyPreference }` |
| `GET` | `/api/products` | — | — | `200 OK`: `List<Product>` |
| `GET` | `/api/products/{id}` | `id` | — | `200 OK`: `Product` (or `404 Not Found`) |
| `GET` | `/api/products/category/{category}` | `category` (`BED`, `SOFA`, etc.) | — | `200 OK`: `List<Product>` |
| `GET` | `/api/products/search` | `keyword` | — | `200 OK`: `List<Product>` |
| `GET` | `/api/products/filter` | `maxPrice` | — | `200 OK`: `List<Product>` |
| `GET` | `/api/products/bundles` | — | — | `200 OK`: `List<FurnitureBundle>` |
| `POST` | `/api/cart/add` | `userId` | `{ itemId, quantity, itemType }` | `200 OK`: `"Item added to cart successfully."` |
| `GET` | `/api/cart` | `userId` | — | `200 OK`: `{ cartId, userId, lines: [...], grandTotal }` |
| `DELETE` | `/api/cart/remove/{cartItemId}` | `cartItemId`, `userId` | — | `200 OK`: `"Item removed from cart."` |
| `DELETE` | `/api/cart/clear` | `userId` | — | `200 OK`: `"Cart cleared."` |
| `POST` | `/api/order/create` | — | `{ userId, cartId }` | `201 Created`: `{ orderId, status, grandTotal, items: [...] }` |
| `GET` | `/api/order` | `userId` | — | `200 OK`: `List<OrderResponseDTO>` |
| `GET` | `/api/order/{orderId}` | `orderId`, `userId` | — | `200 OK`: `OrderResponseDTO` |
| `PATCH` | `/api/order/{orderId}/status` | `orderId`, `newStatus` | — | `200 OK`: `OrderResponseDTO` |
| `POST` | `/api/payment/process` | — | `{ orderId, gatewayType, amountInPKR }` | `201 Created`: `{ paymentId, transactionId, status: "SUCCESS" }` |
| `GET` | `/api/payment/order/{orderId}` | `orderId` | — | `200 OK`: `PaymentResponseDTO` |
| `POST` | `/api/room-builder/build` | `userId` | `{ roomType, width, length, flooring, wallpaper, furnitureItems }` | `201 Created`: `CustomRoomResponseDTO` |
| `GET` | `/api/room-builder/{roomId}` | `roomId`, `userId` | — | `200 OK`: `CustomRoomResponseDTO` |
| `GET` | `/api/room-builder/user/{userId}` | `userId` | — | `200 OK`: `List<CustomRoomResponseDTO>` |
| `POST` | `/api/room-builder/{roomId}/add-to-cart` | `roomId`, `userId` | `{ quantity }` | `201 Created`: `"Added to cart"` |
| `GET` | `/api/room-builder/products/{roomType}` | `roomType` | — | `200 OK`: `List<ProductDTO>` |
| `POST` | `/api/design-quiz/submit` | `userId` (optional) | `{ style, roomType }` | `201 Created`: `DesignQuizResponseDTO` |
| `GET` | `/api/designers` | — | — | `200 OK`: `List<DesignerDTO>` |
| `GET` | `/api/designers/{id}` | `id` | — | `200 OK`: `DesignerDTO` |

---

## 7. DEAD CODE, UNUSED FILES & REDUNDANT ASSETS

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DEAD CODE AUDIT SUMMARY                                  │
├───────────────────────────────────────────────────────┬──────────────┬───────────────────┤
│ File / Item                                           │ Category     │ Status & Issue    │
├───────────────────────────────────────────────────────┼──────────────┼───────────────────┤
│ frontend/src/main.js                                  │ Frontend     │ Unused default    │
│ frontend/src/counter.js                               │ Frontend     │ Vite boilerplate  │
├───────────────────────────────────────────────────────┼──────────────┼───────────────────┤
│ frontend/src/CartCheckoutFlow.jsx                     │ Frontend     │ Orphaned checkout │
│                                                       │              │ component         │
├───────────────────────────────────────────────────────┼──────────────┼───────────────────┤
│ frontend/src/components/Servicecard.jsx               │ Frontend     │ Not imported      │
│ frontend/src/components/ProductOrbitCard.jsx          │ Frontend     │ Not imported      │
│ frontend/src/components/PaletteLogo.jsx               │ Frontend     │ Not imported      │
│ frontend/src/components/QuizRecommendation.jsx        │ Frontend     │ Not imported      │
├───────────────────────────────────────────────────────┼──────────────┼───────────────────┤
│ frontend/src/assets/floors/Invoice_NED.PDF            │ Asset        │ Misplaced invoice │
│ frontend/src/assets/backgroundpic.jpg                 │ Asset        │ Duplicate image   │
│ frontend/src/assets/javascript.svg, vite.svg, hero.png│ Asset        │ Leftover starters │
├───────────────────────────────────────────────────────┼──────────────┼───────────────────┤
│ CartItem.ItemType.DESIGNER_HIRE                       │ Backend      │ Enum present but  │
│ OrderItem.ItemType.DESIGNER_HIRE                      │ Backend      │ unhandled in logic│
├───────────────────────────────────────────────────────┼──────────────┼───────────────────┤
│ PaymentGateway.ALFABANK                               │ Backend      │ Unsupported stub  │
│                                                       │              │ throwing exception│
└───────────────────────────────────────────────────────┴──────────────┴───────────────────┘
```

### Detailed Breakdown:
1. **`frontend/src/main.js` & `frontend/src/counter.js`**:
   - `index.html` loads `<script type="module" src="/src/main.jsx"></script>`. `main.js` and `counter.js` are leftover default Vite files that attempt to attach to `#counter` and `#app` (which don't exist in `index.html`).
2. **`frontend/src/CartCheckoutFlow.jsx`**:
   - Contains a standalone multi-step checkout flow exporting default function `App` with a hardcoded `const userId = 1`. In `App.jsx` it is routed at `/cart-checkout`, but actual checkout navigation routes to `/payment` using `PaymentPage.jsx`.
3. **Unused Frontend Components**:
   - `Servicecard.jsx`: Self-contained service card definitions, never imported in `Dashboard` or `LandingPage`.
   - `ProductOrbitCard.jsx`: 3D rotating product orbit intended for Landing Page hero, never imported.
   - `PaletteLogo.jsx`: Animated typography logo with staggered color tiles, never imported (pages use inline SVGs).
   - `QuizRecommendation.jsx`: Standalone recommendation component, but `DesignQuiz.jsx` built its own internal recommendation UI instead of importing it.
4. **Misplaced Asset**:
   - `frontend/src/assets/floors/Invoice_NED.PDF`: A PDF invoice file stored inside an image directory.
5. **Backend Dead Enum Branches**:
   - `CartItem.ItemType.DESIGNER_HIRE`: Declared in enum, but if sent to `CartManager.addItemToCart()`, throws `IllegalArgumentException: Invalid itemType`.
   - `PaymentGateway.ALFABANK`: Defined in enum, but `PaymentManager.selectAdapter()` throws `IllegalArgumentException("ALFABANK not yet implemented")`.

---

## 8. PATTERN INCONSISTENCIES & CODE SMELLS

### 8.1 Disparate Data Fetching Patterns (Promises vs Async/Await)
- **`Designers.jsx`** and **`ProductDetails.jsx`** use Promise chaining (`fetch().then(r => r.json()).then(...).catch(...)`).
- **`ProductCatalog.jsx`**, **`RoomBuilder.jsx`**, **`Login.jsx`**, and **`PaymentPage.jsx`** use modern `async/await` with `try/catch/finally`.
- *Fix*: Standardize all frontend HTTP operations using a centralized API utility or Axios instance with interceptors.

### 8.2 Redundant Hardcoded Backend URLs Across 12+ Files
Rather than using `import.meta.env.VITE_API_BASE_URL`, `http://localhost:8081` is hardcoded across:
- `CartCheckoutFlow.jsx:4`
- `QuizRecommendation.jsx:14`
- `ProductOrbitCard.jsx:16`
- `RoomBuilder.jsx:43, 815`
- `Register.jsx:18`
- `ProductDetails.jsx:19`
- `Dashboard.jsx:26`
- `ProductCatalog.jsx:22`
- `Login.jsx:19`
- `PaymentPage.jsx:21`
- `Orders.jsx:19`
- `DesignQuiz.jsx:20`
- `Designers.jsx:15`
- *Special Bug in `RoomBuilder.jsx:815`*: Has `const BASE = "http://localhost:8081"` on line 43, but on line 815 hardcodes `fetch('http://localhost:8081/api/room-builder...')` directly.

### 8.3 CORS Configuration Conflicts
- `CorsConfig.java` allows `http://localhost:5173`, `http://localhost:5174`, and `http://localhost:3000`.
- `ProductController.java` overrides global config with `@CrossOrigin(origins = "http://localhost:5175", allowCredentials = "true")`.
- `DesignerController.java` overrides with `@CrossOrigin(origins = "http://localhost:5173")`.
- Other controllers have no `@CrossOrigin` annotation and rely solely on `CorsConfig`.
- *Fix*: Remove controller-level `@CrossOrigin` annotations and control allowed origins centrally in `CorsConfig.java` or `application.properties`.

### 8.4 Name Collisions: Entity Class vs Inner Enum
- Top-level JPA Entity: [`com.palette.palette.entities.AestheticStyle.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/entities/AestheticStyle.java).
- Inner Enum inside [`Product.java`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/backend/src/main/java/com/palette/palette/entities/Product.java#L66): `public enum AestheticStyle { BOHEMIAN, SCANDINAVIAN, MINIMALIST }`.
- Because both share the exact same identifier, referencing `AestheticStyle` causes ambiguity between the relational entity and the string enum.

### 8.5 Ephemeral Auth State (No Session Storage)
- In `App.jsx`, user authentication is held only in React memory: `const [user, setUser] = useState(null)`.
- If a user refreshes the browser while on `/dashboard`, `/catalog`, or `/room-builder`, `user` resets to `null` and `ProtectedRoute` immediately kicks them back to `/login`.

---

## 9. SECURITY AUDIT: LEAKED SECRETS, HARDCODED CREDENTIALS & CONFIG ISSUES

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SECURITY AUDIT FINDINGS                                  │
├──────────────────────────┬──────────────────────┬──────────┬─────────────────────────────┤
│ Location                 │ Vulnerability Type   │ Severity │ Description                 │
├──────────────────────────┼──────────────────────┼──────────┼─────────────────────────────┤
│ application.properties:4 │ Hardcoded Credential │ HIGH     │ Plaintext database password │
│                          │                      │          │ (value redacted) committed  │
│                          │                      │          │ to git repository.          │
├──────────────────────────┼──────────────────────┼──────────┼─────────────────────────────┤
│ SecurityConfig.java:39   │ Broken Access Control│ HIGH     │ `anyRequest().permitAll()`  │
│                          │                      │          │ allows unauthenticated API  │
│                          │                      │          │ access to all endpoints.    │
├──────────────────────────┼──────────────────────┼──────────┼─────────────────────────────┤
│ JazzCashAdapter.java:53  │ Hardcoded API Key    │ MEDIUM   │ Test API Key & Account ID   │
│                          │                      │          │ `jazzcash_test_key_12345`   │
├──────────────────────────┼──────────────────────┼──────────┼─────────────────────────────┤
│ StripeAdapter.java:15    │ Magic Number / Float │ MEDIUM   │ Hardcoded exchange rate     │
│ Frontend formatters      │                      │          │ `280.0` PKR/USD.            │
├──────────────────────────┼──────────────────────┼──────────┼─────────────────────────────┤
│ assets/floors/           │ Sensitive File Leak  │ MEDIUM   │ `Invoice_NED.PDF` committed │
│                          │                      │          │ to public web assets.       │
├──────────────────────────┼──────────────────────┼──────────┼─────────────────────────────┤
│ Designers.jsx:282        │ Dummy Email Fallback │ LOW      │ `mailto:designer@example.com`│
└──────────────────────────┴──────────────────────┴──────────┴─────────────────────────────┘
```

---

## 10. CRITICAL LOGIC BUGS, OFF-BY-ONES & STATE HANDLING FLAWS

### 10.1 `RoomBuilder.jsx` to `PaymentPage.jsx` State Mismatch
- **The Issue**: In `RoomBuilder.jsx:835-839`, clicking "Proceed to Payment" triggers:
  ```javascript
  onProceedToPayment?.({
      roomId: builtRoom.roomId,
      amountInPKR: builtRoom.totalPrice,
      roomType: builtRoom.roomType,
  })
  ```
- In `App.jsx`, this payload is set as `pendingCart` and passed to `PaymentPage.jsx`.
- In `PaymentPage.jsx:151`, the page immediately executes:
  ```javascript
  body: JSON.stringify({ userId: user.userId, cartId: cart.cartId })
  ```
- Because the object has `roomId` instead of `cartId`, `cart.cartId` is `undefined`. The backend receives `{"userId": 1, "cartId": null}` and rejects order creation with a 404 or 400 Bad Request error!

### 10.2 Category Filter Override Bug in `ProductCatalog.jsx`
- In `ProductCatalog.jsx:568-571`:
  ```javascript
  if (search.trim()) url = `${BASE}/api/products/search?keyword=${encodeURIComponent(search.trim())}`
  else if (maxPrice) url = `${BASE}/api/products/filter?maxPrice=${maxPrice}`
  else if (category !== "ALL") url = `${BASE}/api/products/category/${category}`
  ```
- And client-side filters on lines 576-578:
  ```javascript
  if (roomType !== "ALL") data = data.filter(p => p.roomType === roomType)
  if (style !== "ALL") data = data.filter(p => p.aestheticStyle === style)
  ```
- **The Bug**: If a user selects both a Category (e.g. `SOFA`) and a Max Price Cap (e.g. `Under PKR 50,000`), the `maxPrice` branch executes and ignores the category endpoint. Because `category` is **not** checked in the client-side `.filter()` block, the user sees *all* product categories under that price, completely ignoring their category filter!

### 10.3 `Register.jsx` Prop Ignored & No Auto-Login
- In `App.jsx`:
  ```jsx
  <Register onSwitch={() => navigate("/login")} onBack={() => navigate("/")} onSuccess={handleAuth} />
  ```
- In `Register.jsx:5`:
  ```javascript
  export default function Register({ onSwitch }) { ... }
  ```
- **The Bug**: `Register` only destructured `onSwitch`. It completely ignores `onBack` and `onSuccess`. When a user successfully registers, `onSuccess` is never called, leaving the user on the registration form rather than logging them in and navigating to the dashboard.

### 10.4 Non-Unique `findByName` Lookup in `RoomBuilderService.java`
- `RoomBuilderService.java:113, 120, 128` uses `productRepository.findByName(name)`.
- If two vendors upload products with identical names (or if multiple versions exist), Spring Data JPA throws `IncorrectResultSizeDataAccessException` (Non-Unique Result) and the entire room build fails with a 500 error.
- Furthermore, if a name has a trailing space or casing mismatch, `findByName` returns empty and silently prices the item at PKR 0.0.

### 10.5 Duplicate Column Mapping in `CustomRoom.java` and `Payment.java`
- `CustomRoom.java` declares both `width` and `width_ft`, `length` and `length_ft`, `totalPrice` and `total_price_inpkr`.
- `Payment.java` declares both `amountpkr` and `amount_inpkr`, `amountusd` and `amount_inusd`, `transaction_id` and `transactionid`.
- If these mirror fields fall out of sync during manual entity updates, PostgreSQL throws `NOT NULL` constraint violations.

---

## 11. UNFINISHED, PLACEHOLDER & STUBBED FEATURES

1. **Designer Consultation Booking**:
   - `Designers.jsx` displays an hourly rate and a "Book Consultation" button, but the button is a static `mailto:designer@example.com` link. No calendar booking or checkout integration exists.
2. **Missing Quiz Background Images**:
   - In `DesignQuiz.jsx:36, 48, 60, 72`, questions have `image: ''` with placeholder diagonal stripes.
3. **Empty Unit Tests**:
   - `backend/src/test/java/com/palette/palette/PaletteApplicationTests.java` contains an empty `contextLoads()` method. No integration or unit tests exist for cart calculations, room pricing, or discount factories.

---

## 12. COMPLETE INVENTORY OF TODO, FIXME & HACK COMMENTS

| File Path | Line Number | Comment Snippet | Description |
|---|---|---|---|
| [`LandingPage.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/LandingPage.jsx#L86) | 86 | `// TODO — real project photos:` | Designer portfolio project images placeholder. |
| [`LandingPage.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/LandingPage.jsx#L95) | 95 | `// TODO: bright, uncluttered living/dining room...` | Placeholder image reference for Aisha K. |
| [`LandingPage.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/LandingPage.jsx#L104) | 104 | `// TODO: layered textiles, warm terracotta tones...` | Placeholder image reference for Marco D. |
| [`LandingPage.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/LandingPage.jsx#L113) | 113 | `// TODO: pale wood tones, soft linen...` | Placeholder image reference for Farah I. |
| [`LandingPage.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/LandingPage.jsx#L674) | 674 | `{/* TODO: replace the placeholder email, WhatsApp...*/}` | Footer contact placeholder. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L26) | 26 | `// TODO — full-bleed photos:` | Full-bleed IKEA-style quiz backgrounds placeholder. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L36) | 36 | `image: '', // TODO: image: ColorPaletteBg` | Color palette question background image. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L48) | 48 | `image: '', // TODO: image: TextureBg` | Texture question background image. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L60) | 60 | `image: '', // TODO: image: MoodBg` | Room mood question background image. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L72) | 72 | `image: '', // TODO: image: InspirationBg` | Inspiration question background image. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L95) | 95 | `// TODO — room thumbnails:` | Room thumbnail image placeholders. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L108) | 108 | `// TODO — style photos:` | Style preview photography placeholders. |
| [`DesignQuiz.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/DesignQuiz.jsx#L203) | 203 | `// TODO: swap this gradient for a real full-bleed...` | Question card styling placeholder. |
| [`RoomBuilder.jsx`](file:///c:/Users/HP/Documents/GitHub/palette-sda-project/frontend/src/pages/RoomBuilder.jsx#L47) | 47 | `// TODO — set 'image' per room...` | Full-bleed room header photography. |

---

## 13. SENIOR ENGINEER REMEDIATION ROADMAP

### Priority 1: High-Severity Fixes (Immediate)
1. **Move Database Credentials to Environment Variables**:
   Update `backend/src/main/resources/application.properties` to read from environment variables:
   ```properties
   spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/palette}
   spring.datasource.username=${DB_USERNAME:postgres}
   spring.datasource.password=${DB_PASSWORD}
   ```
2. **Fix `RoomBuilder.jsx` $\to$ `PaymentPage.jsx` Checkout Bug**:
   When user clicks "Proceed to Payment" in `RoomBuilder.jsx`, first call `handleAddToCart(builtRoom.roomId)`, wait for cart creation, then fetch the updated cart and pass the real `cart` object with `cartId` to `onProceedToPayment(cart)`.
3. **Fix `ProductCatalog.jsx` Multi-Filter Logic**:
   Ensure client-side filtering applies `category` if `category !== "ALL"`, even when `maxPrice` or `search` endpoints are called.
4. **Delete Misplaced Invoice File**:
   Remove `frontend/src/assets/floors/Invoice_NED.PDF` from source control.

### Priority 2: Code Quality & Architecture Cleanup
1. **Delete Dead Files**:
   Remove `main.js`, `counter.js`, `CartCheckoutFlow.jsx`, `Servicecard.jsx`, `PaletteLogo.jsx`, and `ProductOrbitCard.jsx`.
2. **Standardize API Base URL**:
   Create `frontend/src/config/api.js` exporting `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'` and replace all hardcoded strings.
3. **Persist User Session in `App.jsx`**:
   Initialize `user` state from `localStorage.getItem('palette_user')` and write updates upon login/logout so page refreshes do not log the user out.
4. **Clean up Database Entity Duplication**:
   Remove legacy columns (`amountpkr`, `amountusd`, `transactionid`, `width_ft`, `length_ft`) and adopt Flyway/Liquibase migrations for PostgreSQL schema evolution.
