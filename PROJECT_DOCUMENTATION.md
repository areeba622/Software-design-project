# PALETTE SDA PROJECT - COMPLETE DOCUMENTATION

## 🎯 PROJECT OVERVIEW

**Palette SDA** is an Interior Design & Furniture E-Commerce Platform built with Spring Boot 3.5.14 and Java 21. It implements design patterns (Factory, Singleton, Adapter, Composite) to manage furniture bundles, design quizzes, shopping carts, orders, and payments with support for multiple payment gateways.

**Tech Stack:**
- Backend: Spring Boot 3.5.14, Java 21, Spring Security, Spring Data JPA
- Database: PostgreSQL
- Frontend: Vite + JavaScript
- Build Tool: Maven

**Server Port:** 8081  
**Database:** PostgreSQL (localhost:5432/palette)

---

## 📁 COMPLETE PROJECT STRUCTURE

### **ROOT STRUCTURE**
```
palette-sda-project/
├── backend/                          # Spring Boot Application
│   ├── mvnw / mvnw.cmd              # Maven Wrapper
│   ├── pom.xml                       # Maven Configuration
│   ├── .mvn/                         # Maven Configuration Files
│   ├── src/main/
│   │   ├── java/com/palette/palette/
│   │   │   ├── PaletteApplication.java
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── exceptions/
│   │   │   ├── patterns/
│   │   │   ├── repository/
│   │   │   └── services/
│   │   └── resources/
│   │       └── application.properties
│   ├── src/test/
│   └── target/                       # Compiled Output
├── frontend/                          # Vite + JavaScript
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── main.js
│   │   ├── style.css
│   │   ├── counter.js
│   │   └── assets/
│   └── public/
└── curl/                              # API Test Scripts

```

---

## 🔧 BACKEND - COMPLETE FILE STRUCTURE & DOCUMENTATION

### **1. MAIN APPLICATION CLASS**

#### **PaletteApplication.java**
```
Location: src/main/java/com/palette/palette/
Purpose: Spring Boot Application Entry Point
```

**Methods:**
- `main(String[] args)` - Starts the Spring Boot application

**Variables:**
- None (static method only)

---

### **2. CONFIGURATION LAYER**

#### **SecurityConfig.java**
```
Location: src/main/java/com/palette/palette/config/
Purpose: Spring Security Configuration for the application
```

**Methods:**
1. `passwordEncoder()` - Creates BCryptPasswordEncoder bean (strength=12)
2. `filterChain(HttpSecurity http)` - Configures security filter chain

**Variables:**
- None (all configuration via beans)

**Security Rules:**
- CSRF disabled (REST API)
- Stateless session (SessionCreationPolicy.STATELESS)
- `/api/auth/**` → Public (permitAll)
- All other routes → Public (permitting for now)

---

### **3. CONTROLLER LAYER**

#### **AuthController.java**
```
Location: src/main/java/com/palette/palette/controller/
Purpose: Handles user registration and login
```

**Dependencies:** AuthService

**Methods:**
1. `register(@Valid @RequestBody RegisterRequestDTO)` → `ResponseEntity<AuthResponseDTO>`
   - POST /api/auth/register
   - Creates new user account with password hashing

2. `login(@Valid @RequestBody LoginRequestDTO)` → `ResponseEntity<AuthResponseDTO>`
   - POST /api/auth/login
   - Validates credentials and returns user profile

**Variables:**
- `private final AuthService authService` - Injected service

---

#### **ProductController.java**
```
Location: src/main/java/com/palette/palette/controller/
Purpose: Manages product and furniture bundle catalog endpoints
```

**Dependencies:** ECommerceService

**Methods:**
1. `getAllProducts()` - GET /api/products → `List<Product>`
2. `getProductById(Long id)` - GET /api/products/{id} → `Product`
3. `getByCategory(String category)` - GET /api/products/category/{category} → `List<Product>`
4. `searchProducts(String keyword)` - GET /api/products/search?keyword=X → `List<Product>`
5. `filterByMaxPrice(Double maxPrice)` - GET /api/products/filter?maxPrice=X → `List<Product>`
6. `getStandaloneProducts()` - GET /api/products/standalone → `List<Product>`
7. `getAllBundles()` - GET /api/products/bundles → `List<FurnitureBundle>`
8. `getBundleById(Long id)` - GET /api/products/bundles/{id} → `FurnitureBundle`
9. `getBundlesByRoomType(String roomType)` - GET /api/products/bundles/room/{roomType} → `List<FurnitureBundle>`
10. `getBundlesByMaxPrice(Double maxPrice)` - GET /api/products/bundles/filter?maxPrice=X → `List<FurnitureBundle>`

**Variables:**
- `private final ECommerceService eCommerceService` - Injected service

---

#### **CartController.java**
```
Location: src/main/java/com/palette/palette/controller/
Purpose: Manages shopping cart operations
```

**Dependencies:** CartManager

**Methods:**
1. `addItemToCart(Long userId, CartItemRequestDTO)` - POST /api/cart/add?userId=X → `String`
   - Adds product/bundle to cart

2. `getCart(Long userId)` - GET /api/cart?userId=X → `CartResponseDTO`
   - Returns full cart snapshot with totals

3. `removeItem(Long cartItemId, Long userId)` - DELETE /api/cart/remove/{cartItemId}?userId=X → `String`
   - Removes single item from cart

4. `clearCart(Long userId)` - DELETE /api/cart/clear?userId=X → `String`
   - Clears entire cart (used after order placement)

**Variables:**
- `private final CartManager cartManager` - Injected service

---

#### **OrderController.java**
```
Location: src/main/java/com/palette/palette/controller/
Purpose: Manages order creation and retrieval
```

**Dependencies:** OrderService

**Methods:**
1. `createOrder(OrderRequestDTO)` - POST /api/order/create → `OrderResponseDTO`
   - Converts cart into finalized order

2. `getOrder(Long orderId, Long userId)` - GET /api/order/{orderId}?userId=X → `OrderResponseDTO`
   - Retrieves order with access control

3. Additional methods for getting user orders (expandable)

**Variables:**
- `private final OrderService orderService` - Injected service

---

#### **DesignQuizController.java**
```
Location: src/main/java/com/palette/palette/controller/
Purpose: Handles interior design quiz and recommendations
```

**Dependencies:** DesignQuizService

**Methods:**
1. `submitQuiz(DesignQuizRequestDTO)` - POST /api/design-quiz/submit → `DesignQuizResponseDTO`
   - Processes quiz and returns style bundle with recommendations

2. `submitQuizWithUser(DesignQuizRequestDTO, Long userId)` - POST /api/design-quiz/submit?userId=X → `DesignQuizResponseDTO`
   - Same as above but saves quiz to user history

**Variables:**
- `private final DesignQuizService designQuizService` - Injected service

---

#### **PaymentController.java**
```
Location: src/main/java/com/palette/palette/controller/
Purpose: Manages payment processing
```

**Dependencies:** PaymentService

**Methods:**
1. `processPayment(PaymentRequestDTO)` - POST /api/payment/process → `PaymentResponseDTO`
   - Processes payment via gateway (Stripe/JazzCash)

2. `getPaymentById(Long id)` - GET /api/payment/{id} → `PaymentResponseDTO`
   - Retrieves payment by ID

3. `getPaymentByTransactionId(String transactionId)` - GET /api/payment/tx/{transactionId} → `PaymentResponseDTO`
   - Retrieves payment by transaction ID

4. `getPaymentByOrderId(Long orderId)` - GET /api/payment/order/{orderId} → `PaymentResponseDTO`
   - Retrieves payment associated with order

**Variables:**
- `private final PaymentService paymentService` - Injected service

---

### **4. SERVICE LAYER**

#### **AuthService.java**
```
Location: src/main/java/com/palette/palette/services/
Purpose: Business logic for user authentication
```

**Dependencies:** UserRepository, CartRepository, BCryptPasswordEncoder

**Methods:**
1. `register(RegisterRequestDTO)` → `AuthResponseDTO`
   - Creates new user with hashed password
   - Provisions empty cart immediately
   - Validates duplicate email

2. `login(LoginRequestDTO)` → `AuthResponseDTO`
   - Validates credentials using BCrypt
   - Returns user profile on success

**Variables:**
- `private final UserRepository userRepository`
- `private final CartRepository cartRepository`
- `private final BCryptPasswordEncoder passwordEncoder`

---

#### **ECommerceService.java**
```
Location: src/main/java/com/palette/palette/services/
Purpose: Product and bundle catalog operations
```

**Dependencies:** ProductRepository, FurnitureBundleRepository

**Methods:**
1. `getAllProducts()` → `List<Product>`
2. `getProductById(Long id)` → `Product`
3. `getProductsByCategory(String category)` → `List<Product>`
4. `searchProductsByKeyword(String keyword)` → `List<Product>`
5. `getProductsByMaxPrice(Double maxPrice)` → `List<Product>`
6. `getStandaloneProducts()` → `List<Product>` (products with no bundle)
7. `getAllBundles()` → `List<FurnitureBundle>`
8. `getBundleById(Long id)` → `FurnitureBundle`
9. `getBundlesByRoomType(String roomType)` → `List<FurnitureBundle>`
10. `getBundlesByMaxPrice(Double maxPrice)` → `List<FurnitureBundle>`

**Variables:**
- `private final ProductRepository productRepository`
- `private final FurnitureBundleRepository bundleRepository`

---

#### **CartManager.java**
```
Location: src/main/java/com/palette/palette/services/
Purpose: Shopping cart management with Singleton session store (PATTERN: Singleton)
```

**Dependencies:** CartRepository, CartItemRepository, ProductRepository, FurnitureBundleRepository, UserRepository

**Methods:**
1. `getOrCreateCart(Long userId)` → `Cart`
   - Retrieves or creates cart for user
   - Maintains session store (ConcurrentHashMap)

2. `addItemToCart(Long userId, CartItemRequestDTO)` → void
   - Adds product or bundle to cart
   - Updates quantity if item exists

3. `removeItemFromCart(Long userId, Long cartItemId)` → void
   - Removes specific item from cart

4. `clearCart(Long userId)` → void
   - Empties entire cart after checkout

5. `getCartSummary(Long userId)` → `CartResponseDTO`
   - Returns cart with calculated totals

**Variables:**
- `private final CartRepository cartRepository`
- `private final CartItemRepository cartItemRepository`
- `private final ProductRepository productRepository`
- `private final FurnitureBundleRepository bundleRepository`
- `private final UserRepository userRepository`
- `private final ConcurrentHashMap<Long, Cart> activeCartSessions` - Session store (Singleton pattern)

---

#### **OrderService.java**
```
Location: src/main/java/com/palette/palette/services/
Purpose: Order management and checkout
```

**Dependencies:** OrderRepository, OrderItemRepository, CartRepository, UserRepository

**Methods:**
1. `createOrderFromCart(OrderRequestDTO)` → `OrderResponseDTO`
   - Converts cart to order
   - Creates OrderItem snapshots
   - Clears cart after conversion
   - Validates user and cart ownership

2. `getOrderById(Long orderId, Long userId)` → `OrderResponseDTO`
   - Retrieves order with access control

3. `getOrdersByUserId(Long userId)` → `List<OrderResponseDTO>`
   - Gets all orders for a user

4. Additional query methods (expandable)

**Variables:**
- `private final OrderRepository orderRepository`
- `private final OrderItemRepository orderItemRepository`
- `private final CartRepository cartRepository`
- `private final UserRepository userRepository`

---

#### **PaymentService.java**
```
Location: src/main/java/com/palette/palette/services/
Purpose: Payment processing orchestration
```

**Dependencies:** PaymentRepository, OrderRepository, PaymentManager (Singleton)

**Methods:**
1. `processPayment(PaymentRequestDTO)` → `PaymentResponseDTO`
   - Loads order
   - Routes to PaymentManager (Singleton)
   - Selects adapter (Stripe/JazzCash)
   - Updates order status to CONFIRMED
   - Saves payment record

2. `getPaymentById(Long id)` → `PaymentResponseDTO`
3. `getPaymentByTransactionId(String txId)` → `PaymentResponseDTO`
4. `getPaymentByOrderId(Long orderId)` → `PaymentResponseDTO`

**Variables:**
- `private final PaymentRepository paymentRepository`
- `private final OrderRepository orderRepository`
- `private final PaymentManager paymentManager` (Singleton)

---

#### **DesignQuizService.java**
```
Location: src/main/java/com/palette/palette/services/
Purpose: Interior design quiz and recommendations using Factory pattern
```

**Dependencies:** ProductRepository, DesignQuizRepository, UserRepository, AestheticBundleFactory

**Methods:**
1. `submitQuiz(DesignQuizRequestDTO, Long userId)` → `DesignQuizResponseDTO`
   - Calls AestheticBundleFactory to create style bundle
   - Filters products by room type and aesthetic style
   - Calculates discounted price
   - Saves quiz history if userId provided
   - Returns bundle with recommended products

2. `saveQuizHistory(Long userId, String style, String roomType)` → void
   - Saves quiz to DesignQuiz entity

**Variables:**
- `private final ProductRepository productRepository`
- `private final DesignQuizRepository designQuizRepository`
- `private final UserRepository userRepository`

---

### **5. DATA TRANSFER OBJECTS (DTOs)**

#### **RegisterRequestDTO.java**
```
Variables:
- fullName: String (NotBlank)
- email: String (NotBlank, Email)
- password: String (NotBlank, Size >= 6)
- currencyPreference: CurrencyPreference (NotNull, PKR/USD)
```

#### **LoginRequestDTO.java**
```
Variables:
- email: String
- password: String
```

#### **AuthResponseDTO.java**
```
Variables:
- userId: Long
- email: String
- fullName: String
- currencyPreference: CurrencyPreference
- message: String
```

#### **CartItemRequestDTO.java**
```
Variables:
- itemId: Long
- quantity: Integer
- itemType: String (PRODUCT, BUNDLE, CUSTOM_ROOM, DESIGNER_HIRE)
```

#### **CartResponseDTO.java**
```
Variables:
- cartId: Long
- userId: Long
- lines: List<CartLineDTO>
- grandTotal: double

Nested CartLineDTO:
- cartItemId: Long
- itemType: String
- itemId: Long
- itemName: String
- quantity: int
- unitPrice: double
- lineTotal: double
```

#### **OrderRequestDTO.java**
```
Variables:
- userId: Long
- cartId: Long
```

#### **OrderResponseDTO.java**
```
Variables:
- orderId: Long
- userId: Long
- status: OrderStatus
- grandTotal: Double
- createdAt: LocalDateTime
- items: List<OrderLineDTO>

Nested OrderLineDTO:
- itemId: Long
- itemType: String
- itemName: String
- quantity: Integer
- unitPrice: Double
- lineTotal: Double
```

#### **DesignQuizRequestDTO.java**
```
Variables:
- style: String (BOHEMIAN, SCANDINAVIAN, MINIMALIST)
- roomType: String
```

#### **DesignQuizResponseDTO.java**
```
Variables:
- aestheticStyle: String
- roomType: String
- recommendationTitle: String
- message: String
- recommendedBundle: BundleDTO
- bundleProducts: List<ProductDTO>

Nested BundleDTO:
- id: Long
- name: String
- description: String
- discountFactor: Double
- totalPrice: Double
```

#### **PaymentRequestDTO.java**
```
Variables:
- orderId: Long
- gatewayType: String (STRIPE, JAZZCASH)
- amountInPKR: Double
```

#### **PaymentResponseDTO.java**
```
Variables:
- paymentId: Long
- orderId: Long
- gateway: String
- status: String
- amountInPKR: Double
- amountInUSD: Double
- transactionId: String
- createdAt: LocalDateTime
- message: String
```

#### **ProductDTO.java**
```
Variables:
- id: Long
- name: String
- description: String
- priceInPKR: Double
- imageUrl: String
- category: String
- roomType: String
- aestheticStyle: String
```

---

### **6. ENTITY LAYER (JPA Entities)**

#### **User.java** - `@Entity @Table("users")`
```
Variables:
- id: Long (PK, GeneratedValue)
- email: String (Unique, NotNull)
- fullName: String (NotNull)
- passwordHash: String (NotNull)
- currencyPreference: CurrencyPreference (Enum: PKR/USD)
- cart: Cart (OneToOne, Cascade)
- orders: List<Order> (OneToMany, Cascade)

Methods:
- Constructors (empty, full)
- Getters/Setters for all fields
- equals(), hashCode()
```

#### **Product.java** - `@Entity @Table("products")` - Implements InventoryItem
```
Variables:
- id: Long (PK, GeneratedValue)
- name: String (NotNull)
- description: String (VARCHAR 500)
- priceInPKR: Double (NotNull)
- imageUrl: String
- category: ProductCategory (Enum: BED, CHAIR, TABLE, LAMP, RUG, WARDROBE, SOFA, FLOORING, WALLPAPER, DECOR, OTHER)
- roomType: RoomType (Enum: BEDROOM, LIVING_ROOM, KITCHEN, DINING_ROOM, GAME_ROOM, OFFICE)
- aestheticStyle: AestheticStyle (Enum: BOHEMIAN, SCANDINAVIAN, MINIMALIST)
- vendorName: String
- bundle: FurnitureBundle (ManyToOne, JsonBackReference)

Methods:
- Constructors
- Getters/Setters
- getPrice() - From InventoryItem interface
```

#### **Cart.java** - `@Entity @Table("carts")`
```
Variables:
- id: Long (PK, GeneratedValue)
- user: User (OneToOne, NotNull, Unique)
- items: List<CartItem> (OneToMany, Cascade, FetchEager)

Methods:
- Constructors
- Getters/Setters
- getGrandTotal() - Sums all line items
- equals(), hashCode(), toString()
```

#### **CartItem.java** - `@Entity @Table("cart_items")`
```
Variables:
- id: Long (PK, GeneratedValue)
- cart: Cart (ManyToOne, NotNull)
- itemType: ItemType (Enum: PRODUCT, BUNDLE, CUSTOM_ROOM, DESIGNER_HIRE)
- product: Product (ManyToOne, nullable)
- bundle: FurnitureBundle (ManyToOne, nullable)
- customRoom: CustomRoom (ManyToOne, nullable)
- designer: Designer (ManyToOne, nullable)
- quantity: Integer (NotNull, default=1)
- unitPrice: Double (NotNull, default=0.0)

Methods:
- Constructors
- Getters/Setters
- getLineTotal() - unitPrice × quantity
```

#### **Order.java** - `@Entity @Table("orders")`
```
Variables:
- id: Long (PK, GeneratedValue)
- user: User (ManyToOne, NotNull)
- createdAt: LocalDateTime (NotNull, @PrePersist)
- status: OrderStatus (Enum: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- grandTotal: Double (NotNull, column="total_amountpkr")
- items: List<OrderItem> (OneToMany, Cascade)
- payment: Payment (OneToOne, Cascade)

Methods:
- Constructors
- Getters/Setters
- @PrePersist - Sets createdAt
```

#### **OrderItem.java** - `@Entity @Table("order_items")`
```
Variables:
- id: Long (PK)
- order: Order (ManyToOne, NotNull)
- itemType: ItemType (Enum: PRODUCT, BUNDLE, CUSTOM_ROOM, DESIGNER_HIRE)
- product: Product (ManyToOne, nullable)
- bundle: FurnitureBundle (ManyToOne, nullable)
- quantity: Integer (NotNull)
- unitPrice: Double (NotNull)

Methods:
- Constructors
- Getters/Setters
- getLineTotal()
```

#### **Payment.java** - `@Entity @Table("payments")`
```
Variables:
- id: Long (PK, GeneratedValue)
- order: Order (OneToOne, NotNull)
- gateway: PaymentGateway (Enum: STRIPE, JAZZCASH, ALFABANK)
- status: PaymentStatus (Enum: PENDING, SUCCESS, FAILED, CANCELLED)
- amountInPKR: Double (NotNull)
- amountInUSD: Double (nullable)
- transactionId: String
- createdAt: LocalDateTime (NotNull, default=now)

Methods:
- Constructors
- Getters/Setters
```

#### **FurnitureBundle.java** - `@Entity @Table("furniture_bundles")` - Implements InventoryItem
```
Variables:
- id: Long (PK, GeneratedValue)
- name: String (NotNull)
- description: String
- roomType: RoomType (Enum: BEDROOM, LIVING_ROOM, GAME_ROOM, KITCHEN, DINING_ROOM, OFFICE)
- style: AestheticStyle (ManyToOne)
- products: List<Product> (OneToMany, JsonManagedReference, Cascade, FetchEager)
- discountFactor: Double (NotNull, default=1.0)
- totalPriceInPKR: Double (NotNull, default=0.0)

Methods:
- Constructors
- Getters/Setters
- getPrice() - From InventoryItem interface
- Calculates total from products
```

#### **DesignQuiz.java** - `@Entity @Table("design_quizzes")`
```
Variables:
- id: Long (PK, GeneratedValue)
- user: User (ManyToOne, NotNull)
- selectedStyle: String (NotNull, BOHEMIAN/SCANDINAVIAN/MINIMALIST)
- selectedRoomType: String (NotNull)
- createdAt: LocalDateTime (NotNull, default=now)

Methods:
- Constructors
- Getters/Setters
- toString()
```

#### **AestheticStyle.java** - `@Entity @Table("aesthetic_styles")`
```
Variables:
- id: Long (PK)
- name: String (Enum: BOHEMIAN, SCANDINAVIAN, MINIMALIST)
- description: String

Methods:
- Constructors
- Getters/Setters
```

#### **CustomRoom.java**, **Designer.java**
```
Placeholder entities for future expansion
```

---

### **7. REPOSITORY LAYER (JPA Repositories)**

#### **UserRepository.java**
```
Methods:
- findByEmail(String email) → Optional<User>
- existsByEmail(String email) → boolean
```

#### **ProductRepository.java**
```
Methods:
- findByBundleId(Long bundleId) → List<Product>
- findByCategory(ProductCategory category) → List<Product>
- findByPriceInPKRLessThanEqual(Double maxPrice) → List<Product>
- findByNameContainingIgnoreCase(String keyword) → List<Product>
- findByBundleIsNull() → List<Product> (Standalone)
- findByVendorName(String vendorName) → List<Product>
- findByRoomType(RoomType roomType) → List<Product>
- findByAestheticStyle(AestheticStyle style) → List<Product>
- findByRoomTypeAndAestheticStyle(RoomType, AestheticStyle) → List<Product>
```

#### **CartRepository.java**
```
Methods:
- findByUserId(Long userId) → Optional<Cart>
```

#### **CartItemRepository.java**
```
Methods:
- findByCartIdAndProductId(Long cartId, Long productId) → Optional<CartItem>
- findByCartId(Long cartId) → List<CartItem>
- deleteByCartId(Long cartId) → void
```

#### **OrderRepository.java**
```
Methods:
- findByUserId(Long userId) → List<Order>
- findByUserIdAndStatus(Long userId, OrderStatus status) → List<Order>
- findByStatus(OrderStatus status) → List<Order>
- findByUserIdOrderByCreatedAtDesc(Long userId) → List<Order>
- findByIdAndUserId(Long orderId, Long userId) → Optional<Order>
- countByUserId(Long userId) → long
- countByStatus(OrderStatus status) → long
```

#### **OrderItemRepository.java**
```
Methods:
- findByOrderId(Long orderId) → List<OrderItem>
```

#### **PaymentRepository.java**
```
Methods:
- findByOrderId(Long orderId) → Optional<Payment>
- findByTransactionId(String transactionId) → Optional<Payment>
- findByStatus(PaymentStatus status) → List<Payment>
```

#### **FurnitureBundleRepository.java**
```
Methods:
- findByRoomType(RoomType roomType) → List<FurnitureBundle>
- findByTotalPriceInPKRLessThanEqual(Double maxPrice) → List<FurnitureBundle>
```

#### **DesignQuizRepository.java**
```
Methods:
- findByUserId(Long userId) → List<DesignQuiz>
```

---

### **8. EXCEPTION HANDLING**

#### **GlobalExceptionHandler.java** - `@RestControllerAdvice`
```
Methods:
1. handleNotFound(ResourceNotFoundException) → ResponseEntity
   - HTTP 404 responses

2. handleBadRequest(IllegalArgumentException) → ResponseEntity
   - HTTP 400 responses

3. handleValidation(MethodArgumentNotValidException) → ResponseEntity
   - HTTP 400 for validation failures

4. handleGeneric(Exception) → ResponseEntity
   - HTTP 500 for unexpected errors

buildResponse(HttpStatus, String) → ResponseEntity
   - Utility to build standard error response with:
     - timestamp
     - status (HTTP code)
     - error (reason phrase)
     - message (details)
```

#### **ResourceNotFoundException.java**
```
Extends: RuntimeException
Purpose: Thrown when entity not found (404)
```

---

### **9. DESIGN PATTERNS IMPLEMENTATION**

#### **Factory Pattern** - AestheticBundleFactory
```
Location: src/main/java/com/palette/palette/patterns/factory/

Files:
- AestheticBundleFactory.java - Main factory class
- StyleBundle.java - Data carrier returned by factory

Purpose:
Creates style bundles with recommended products based on style + room type

Supported Styles:
- BOHEMIAN (5% discount) - Free-spirited, eclectic, artistic
- SCANDINAVIAN (8% discount) - Light, airy, functional
- MINIMALIST (0% discount) - Clean lines, essential design

Methods:
1. createBundle(String style, String roomType) → StyleBundle
   - Main factory method
   - Validates inputs
   - Routes to specific builder based on style

2. buildBohemianBundle(String roomType) → StyleBundle
3. buildScandinavianBundle(String roomType) → StyleBundle
4. buildMinimalistBundle(String roomType) → StyleBundle

5. getAllStyles() → List<String>
6. getAllRoomTypes() → List<String>

StyleBundle Variables:
- styleName: String
- styleDescription: String
- roomType: String
- recommendedProductIds: List<Long>
- discountFactor: double (e.g., 0.95 = 5% off)
```

#### **Singleton Pattern** - PaymentManager
```
Location: src/main/java/com/palette/palette/patterns/singleton/

File: PaymentManager.java

Purpose:
Single entry point for all payment processing
Thread-safe lazy initialization using double-checked locking

Variables:
- private static volatile PaymentManager instance
- private static final Object lock

Methods:
1. getInstance() → PaymentManager (Thread-safe)
   - Double-checked locking pattern
   - First check (no lock): if instance == null
   - Synchronized block: if instance == null (second check)
   - Returns singleton instance

2. processOrder(String gatewayType, double amountInPKR) → String
   - Routes to appropriate adapter
   - Returns transaction ID
   - Throws IllegalArgumentException for invalid input

3. selectAdapter(String gatewayType) → LocalPaymentProcessor
   - Returns StripeAdapter or JazzCashAdapter
```

#### **Adapter Pattern** - Payment Gateway Adapters
```
Location: src/main/java/com/palette/palette/patterns/adapter/

Files:
- LocalPaymentProcessor.java (Interface)
- StripeAdapter.java (Concrete Adapter)
- JazzCashAdapter.java (Concrete Adapter)

Interface - LocalPaymentProcessor:
Methods:
- payInPKR(double amountInPKR) → String (transaction ID)
- getGatewayType() → String

StripeAdapter:
Converts PKR to USD to Cents for Stripe API
Variables:
- stripeSDK: StripeSDK
- PKR_TO_USD_RATE: double (280.0)

Methods:
1. payInPKR(double amountInPKR) → String
   - Converts PKR → USD (÷280)
   - Converts USD → Cents (×100)
   - Calls Stripe SDK

2. convertPKRToUSD(double amountInPKR) → double

3. getGatewayType() → "STRIPE"

Inner class - StripeSDK (Stub):
- chargeInCents(int cents) → String (txID)
- refund(String txID, int cents) → String
- isConnected() → boolean

JazzCashAdapter:
(Similar structure for JazzCash gateway)
```

#### **Composite Pattern** - Inventory Management
```
Location: src/main/java/com/palette/palette/patterns/composite/

File: InventoryItem.java (Interface)

Purpose:
Treats individual products and product bundles uniformly

Methods:
- getId() → Long
- getName() → String
- getPrice() → double

Implementations:
- Product implements InventoryItem
- FurnitureBundle implements InventoryItem

Benefits:
- Cart can store both products and bundles uniformly
- Composite calculation: Bundle price = sum of product prices × discountFactor
```

---

### **10. APPLICATION CONFIGURATION**

#### **application.properties**
```
spring.application.name=palette

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/palette
spring.datasource.username=postgres
spring.datasource.password=***REMOVED***

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server
server.port=8081
```

---

## 🎨 FRONTEND STRUCTURE

### **Frontend Stack:**
- Build Tool: Vite
- Runtime: JavaScript (ES6+)
- CSS Framework: Custom CSS

### **File Structure:**

#### **index.html**
```
Purpose: Main HTML entry point
Key Elements:
- <div id="app"></div> - React/Vite mount point
- Loads main.js module
```

#### **package.json**
```
{
  "name": "frontend",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",           // Start dev server
    "build": "vite build",   // Build for production
    "preview": "vite preview" // Preview production build
  },
  "devDependencies": {
    "vite": "^8.0.12"
  }
}
```

#### **main.js**
```
Functionality:
- Imports CSS styling
- Imports asset images
- Sets up HTML template with hero section
- Initializes counter component
- Exports setupCounter function

Key Imports:
- './style.css' - Main styles
- './assets/javascript.svg' - JS logo
- './assets/vite.svg' - Vite logo
- './assets/hero.png' - Hero image
- './counter.js' - Counter component

Template Sections:
1. Hero section with logos
2. Get started section
3. Documentation links
4. Social links section
```

#### **counter.js**
```
Exports:
- setupCounter(element) - Initializes button click counter

Functionality:
- Maintains click count state
- Updates button text with current count
- Increments on click
```

#### **style.css**
```
Variables (CSS Custom Properties):
- --text: Text color
- --text-h: Heading text color
- --bg: Background color
- --border: Border color
- --code-bg: Code background
- --accent: Accent color (purple)
- --accent-bg: Accent background
- --accent-border: Accent border
- --social-bg: Social background
- --shadow: Shadow effect
- --sans: Sans-serif font family
- --heading: Heading font family
- --mono: Monospace font family

Features:
- Dark mode support (@media prefers-color-scheme: dark)
- Responsive design (max-width: 1024px)
- Font optimization
- Color scheme flexibility
```

#### **assets/ Directory**
```
Contents:
- javascript.svg - JavaScript logo
- vite.svg - Vite build tool logo
- hero.png - Hero section image
- (Additional SVG icons for social links)
```

---

## 🔄 COMPLETE WORKFLOW - HOW THE PROJECT WORKS

### **USER REGISTRATION & LOGIN**
```
1. POST /api/auth/register
   ├── RegisterRequestDTO (fullName, email, password, currencyPreference)
   ├── AuthService.register()
   │   ├── Validate duplicate email via UserRepository
   │   ├── Hash password with BCryptPasswordEncoder
   │   ├── Save User entity
   │   ├── Provision empty Cart
   │   └── Return AuthResponseDTO
   └── Response 201 CREATED

2. POST /api/auth/login
   ├── LoginRequestDTO (email, password)
   ├── AuthService.login()
   │   ├── Find User by email
   │   ├── Validate password with BCrypt
   │   └── Return AuthResponseDTO
   └── Response 200 OK
```

### **PRODUCT CATALOG BROWSING**
```
1. GET /api/products
   └── ECommerceService.getAllProducts() → List<Product>

2. GET /api/products/{id}
   └── ECommerceService.getProductById() → Product

3. GET /api/products/category/{category}
   └── ECommerceService.getProductsByCategory() → List<Product>

4. GET /api/products/search?keyword=sofa
   └── ECommerceService.searchProductsByKeyword() → List<Product>

5. GET /api/products/filter?maxPrice=50000
   └── ECommerceService.getProductsByMaxPrice() → List<Product>

6. GET /api/products/bundles
   └── ECommerceService.getAllBundles() → List<FurnitureBundle>
```

### **DESIGN QUIZ FLOW**
```
1. POST /api/design-quiz/submit
   ├── DesignQuizRequestDTO (style, roomType)
   ├── DesignQuizService.submitQuiz()
   │   ├── Validate inputs (non-blank, non-null)
   │   ├── Call AestheticBundleFactory.createBundle(style, roomType)
   │   │   └── Factory creates StyleBundle with:
   │   │       - Recommended product IDs
   │   │       - Discount factor
   │   │       - Style description
   │   ├── Filter products by room type and aesthetic style
   │   ├── Map products to ProductDTO list
   │   ├── Calculate total price (sum of products)
   │   ├── Apply discount: totalPrice × discountFactor
   │   ├── Save DesignQuiz record if userId provided
   │   └── Return DesignQuizResponseDTO
   └── Response 201 CREATED

DesignQuizResponseDTO contains:
- aestheticStyle: BOHEMIAN/SCANDINAVIAN/MINIMALIST
- roomType: Selected room
- message: "Perfect BOHEMIAN BEDROOM setup!"
- recommendedBundle: Bundle details
- bundleProducts: List<ProductDTO> (filtered recommendations)
- estimatedBundlePrice: Discounted total
```

### **SHOPPING CART FLOW**
```
1. POST /api/cart/add?userId=1
   ├── CartItemRequestDTO (itemId, quantity, itemType)
   ├── CartManager.addItemToCart()
   │   ├── Get/Create cart via CartManager.getOrCreateCart() (Singleton pattern)
   │   ├── Load product/bundle from database
   │   ├── Check if item already in cart
   │   ├── If yes: Update quantity
   │   ├── If no: Create new CartItem
   │   └── Save CartItem
   └── Response 200 OK "Item added to cart successfully"

2. GET /api/cart?userId=1
   ├── CartManager.getCartSummary(userId)
   │   ├── Get/Create cart (Singleton session store)
   │   ├── Iterate over CartItems
   │   ├── For each item: Get InventoryItem (Product or Bundle)
   │   ├── Calculate lineTotal = unitPrice × quantity
   │   ├── Build CartLineDTO for each item
   │   ├── Calculate grandTotal = sum of all lineTotal
   │   └── Return CartResponseDTO with lines and total
   └── Response 200 OK with CartResponseDTO

3. DELETE /api/cart/remove/{cartItemId}?userId=1
   ├── CartManager.removeItemFromCart(userId, cartItemId)
   │   ├── Load CartItem
   │   ├── Verify ownership (cart belongs to user)
   │   └── Delete CartItem
   └── Response 200 OK "Item removed from cart"

4. DELETE /api/cart/clear?userId=1
   ├── CartManager.clearCart(userId)
   │   ├── Load Cart
   │   ├── Delete all CartItems
   │   └── Save empty Cart
   └── Response 200 OK "Cart cleared"

Session Store (Singleton):
- CartManager maintains ConcurrentHashMap<Long, Cart> activeCartSessions
- Reduces database queries for repeated cart access
- Thread-safe with concurrent access
```

### **CHECKOUT & ORDER CREATION FLOW**
```
1. POST /api/order/create
   ├── OrderRequestDTO (userId, cartId)
   ├── OrderService.createOrderFromCart()
   │   ├── Load User (404 if not found)
   │   ├── Load Cart (404 if not found)
   │   ├── Validate cart ownership (400 if user mismatch)
   │   ├── Validate cart not empty (400 if empty)
   │   ├── Calculate grandTotal from cart items
   │   ├── Create Order entity with:
   │   │   - user: User
   │   │   - grandTotal: Calculated amount
   │   │   - status: PENDING
   │   │   - createdAt: Current timestamp
   │   ├── Create OrderItem snapshot for each CartItem:
   │   │   - Preserves product/bundle data at time of order
   │   │   - Captures quantity and unitPrice
   │   ├── Save Order and OrderItems
   │   ├── Clear cart
   │   └── Return OrderResponseDTO
   └── Response 201 CREATED

Order Entity State:
- status: PENDING (waiting for payment)
```

### **PAYMENT PROCESSING FLOW**
```
1. POST /api/payment/process
   ├── PaymentRequestDTO (orderId, gatewayType, amountInPKR)
   ├── PaymentService.processPayment()
   │   ├── Load Order (404 if not found)
   │   ├── Create Payment entity:
   │   │   - order: Loaded order
   │   │   - status: PENDING
   │   │   - amountInPKR: From request
   │   │   - createdAt: Current timestamp
   │   │
   │   ├── Call PaymentManager.processOrder() [SINGLETON PATTERN]
   │   │   ├── Validate gateway type and amount
   │   │   ├── Select Adapter:
   │   │   │   - If "STRIPE": Return StripeAdapter [ADAPTER PATTERN]
   │   │   │   - If "JAZZCASH": Return JazzCashAdapter
   │   │   └── Call adapter.payInPKR(amount)
   │   │
   │   │   StripeAdapter.payInPKR():
   │   │   ├── Convert PKR to USD: amountInUSD = amountInPKR / 280
   │   │   ├── Convert USD to cents: amountInCents = amountInUSD × 100
   │   │   ├── Call StripeSDK.chargeInCents(cents)
   │   │   └── Return transactionId (stripe_xxx)
   │   │
   │   │   JazzCashAdapter.payInPKR():
   │   │   ├── Format amount for JazzCash API
   │   │   ├── Call JazzCashSDK
   │   │   └── Return transactionId (jc_xxx)
   │   │
   │   ├── On SUCCESS:
   │   │   ├── Update Payment:
   │   │   │   - status: SUCCESS
   │   │   │   - transactionId: From gateway
   │   │   │   - gateway: STRIPE/JAZZCASH
   │   │   ├── Save Payment record
   │   │   ├── Update Order.status: CONFIRMED
   │   │   ├── Save Order
   │   │   └── Log success
   │   │
   │   ├── On FAILURE:
   │   │   ├── Update Payment:
   │   │   │   - status: FAILED
   │   │   ├── Update Order.status: CANCELLED
   │   │   └── Save records
   │   │
   │   └── Return PaymentResponseDTO
   └── Response 201 CREATED (if success) or 400 BAD REQUEST (if failed)
```

### **GET ORDER FLOW**
```
1. GET /api/order/{orderId}?userId=1
   ├── OrderService.getOrderById(orderId, userId)
   │   ├── Load Order (404 if not found)
   │   ├── Verify order belongs to user (404 if mismatch)
   │   ├── Load associated OrderItems
   │   ├── Build OrderLineDTO for each OrderItem
   │   ├── Build OrderResponseDTO with:
   │   │   - orderId, userId, status
   │   │   - grandTotal, createdAt
   │   │   - items (list of OrderLineDTO)
   │   └── Return OrderResponseDTO
   └── Response 200 OK
```

---

## 📊 DATA RELATIONSHIPS & ERD

```
┌─────────┐
│  User   │
├─────────┤
│ id (PK) │
│ email   │
│ name    │
└────┬────┘
     │ 1:1
     │
     └─────┬──────────────┐
           │              │
        ┌──▼──┐        ┌──▼──┐
        │Cart │        │Order │
        ├─────┤        ├──────┤
        │ id  │        │ id   │
        │items├────┬──►│items │
        └─────┘    │   └──────┘
                   │      │
                ┌──▼───┐  │
                │CartItem   │
                ├────────┤  │
                │itemType│  │
                │product ├──┼─────────┐
                │bundle  │  │         │
                │quantity│  │      ┌──▼────────┐
                └────────┘  │      │ OrderItem │
                            │      ├───────────┤
                            │      │ itemType  │
                            │      │ product   │
                            │      │ bundle    │
                            │      │ quantity  │
                            │      └───────────┘
                            │
        ┌───────────────────┴─────────────────┐
        │                                     │
    ┌───▼─────┐                    ┌────────▼─┐
    │ Product │                    │ Bundle   │
    ├─────────┤                    ├──────────┤
    │ id      │                    │ id       │
    │ name    │                    │ name     │
    │ price   │                    │ discount │
    │ category│                    │ products │
    │ style   │                    └──────────┘
    └─────────┘

Order.payment → Payment (1:1)
Order.status → PENDING → CONFIRMED/CANCELLED
Payment.gateway → STRIPE/JAZZCASH/ALFABANK
Payment.status → PENDING → SUCCESS/FAILED/CANCELLED
```

---

## 🚀 API ENDPOINT SUMMARY

### **Authentication**
```
POST   /api/auth/register      → AuthResponseDTO
POST   /api/auth/login         → AuthResponseDTO
```

### **Products & Catalog**
```
GET    /api/products                        → List<Product>
GET    /api/products/{id}                   → Product
GET    /api/products/category/{category}    → List<Product>
GET    /api/products/search?keyword=X       → List<Product>
GET    /api/products/filter?maxPrice=X      → List<Product>
GET    /api/products/standalone             → List<Product>
GET    /api/products/bundles                → List<FurnitureBundle>
GET    /api/products/bundles/{id}           → FurnitureBundle
GET    /api/products/bundles/room/{type}    → List<FurnitureBundle>
GET    /api/products/bundles/filter?maxPrice=X → List<FurnitureBundle>
```

### **Shopping Cart**
```
POST   /api/cart/add?userId=X               → String
GET    /api/cart?userId=X                   → CartResponseDTO
DELETE /api/cart/remove/{itemId}?userId=X   → String
DELETE /api/cart/clear?userId=X             → String
```

### **Orders**
```
POST   /api/order/create                    → OrderResponseDTO
GET    /api/order/{orderId}?userId=X        → OrderResponseDTO
```

### **Design Quiz**
```
POST   /api/design-quiz/submit              → DesignQuizResponseDTO
POST   /api/design-quiz/submit?userId=X     → DesignQuizResponseDTO
```

### **Payments**
```
POST   /api/payment/process                 → PaymentResponseDTO
GET    /api/payment/{id}                    → PaymentResponseDTO
GET    /api/payment/tx/{transactionId}      → PaymentResponseDTO
GET    /api/payment/order/{orderId}         → PaymentResponseDTO
GET    /api/payment/health                  → Health check
```

---

## 🔐 SECURITY

- **Password Encryption:** BCryptPasswordEncoder (strength=12)
- **CSRF:** Disabled (REST API)
- **Session:** Stateless (SessionCreationPolicy.STATELESS)
- **Auth Routes:** Public (/api/auth/**)
- **Other Routes:** Currently public (tighten per feature)

---

## 📦 DEPENDENCIES

**Spring Boot Starters:**
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation
- spring-boot-starter-web

**Database:**
- postgresql (runtime)

**Utilities:**
- lombok (annotations for boilerplate)

**Testing:**
- spring-boot-starter-test (scope: test)

---

## 🎓 DESIGN PATTERNS SUMMARY

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Factory** | `AestheticBundleFactory` | Create style bundles with curated products |
| **Singleton** | `PaymentManager` | Single entry point for all payments (thread-safe) |
| **Adapter** | `StripeAdapter`, `JazzCashAdapter` | Adapt different payment gateways to common interface |
| **Composite** | `InventoryItem` interface | Treat products and bundles uniformly in cart |

---

## 🏗️ ARCHITECTURAL LAYERS

1. **Controller Layer** → Handles HTTP requests/responses
2. **Service Layer** → Business logic (AuthService, CartManager, OrderService, etc.)
3. **Repository Layer** → Database access (JPA repositories)
4. **Entity Layer** → Domain models (User, Product, Order, etc.)
5. **DTO Layer** → Data transfer between controller and service
6. **Exception Handling** → Centralized via GlobalExceptionHandler
7. **Patterns** → Factory, Singleton, Adapter, Composite

---

## 📝 KEY NOTES

- **Transactional Safety:** @Transactional on service methods ensures ACID compliance
- **Lazy Initialization:** PaymentManager uses double-checked locking for thread safety
- **Validation:** Bean validation (@Valid) on controller method parameters
- **Error Handling:** Custom exceptions mapped to HTTP status codes
- **Composition:** Services composed with repositories for dependency injection
- **Composite Pattern:** Cart can contain both Product and FurnitureBundle items

---

Generated: 2026-06-09  
Project Status: Spring Boot Backend + Vite Frontend Template
