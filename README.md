# Library Management System

A core library management module with a Spring Boot backend and an Angular frontend.

```
library-management-system/
├── backend/      Spring Boot 3 + JPA + MySQL/H2 + Flyway + OpenAPI
├── frontend/     Angular 17 (standalone) + Bootstrap 5 + reactive forms
└── requirements.txt
```

## Features

- Books: CRUD with soft delete, search by title/author/ISBN/category, copy tracking.
- Members: CRUD with deactivation, unique email enforcement.
- Issue / return workflow with business rules:
  - Cannot issue if `availableCopies <= 0`.
  - Cannot issue the same book twice to the same member without returning.
  - Cannot return an already-returned transaction.
  - Auto-decorates `ISSUED` transactions past due date as `OVERDUE` on read.
- Transaction history per book or per member, with pagination.
- Validation + global exception handler returning structured `ErrorResponse` payloads with field-level errors.
- OpenAPI / Swagger UI at `/api/swagger-ui.html`.
- Actuator health endpoint at `/api/actuator/health`.
- Flyway migration `V1__init.sql` creates the schema with indexes & unique constraints.

## Backend — quick start

```bash
cd backend

# Dev profile (in-memory H2 — no DB setup needed)
./mvnw spring-boot:run

# Or build the jar
./mvnw clean package
java -jar target/library-management-system-1.0.0.jar
```

The API is served at `http://localhost:8080/api`. With the dev profile the H2 console is at `http://localhost:8080/api/h2-console` (JDBC URL `jdbc:h2:mem:librarydb`, user `sa`).


### Running against MySQL

```bash
SPRING_PROFILES_ACTIVE=prod \
DB_URL="jdbc:mysql://localhost:3306/librarydb?useSSL=false&serverTimezone=UTC" \
DB_USERNAME=library \
DB_PASSWORD=library \
./mvnw spring-boot:run
```

Flyway runs the migrations at startup.

### Tests

```bash
cd backend
./mvnw test
```

`TransactionServiceTest` covers issue, duplicate-issue rejection, no-copy rejection, return, double-return rejection.

### Key endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/books?q=&page=&size=` | List/search books |
| GET | `/api/v1/books/{id}` | Get book |
| POST | `/api/v1/books` | Create book |
| PUT | `/api/v1/books/{id}` | Update book |
| DELETE | `/api/v1/books/{id}` | Soft-delete book |
| GET | `/api/v1/members?q=&page=&size=` | List/search members |
| POST | `/api/v1/members` | Create member |
| PUT | `/api/v1/members/{id}` | Update member |
| POST | `/api/v1/members/{id}/deactivate` | Deactivate member |
| GET | `/api/v1/transactions?memberId=&bookId=` | Transaction history |
| POST | `/api/v1/transactions/issue` | Issue a book |
| POST | `/api/v1/transactions/{id}/return` | Return a book |
| POST | `/api/v1/transactions/mark-overdue` | Sweep ISSUED past due into OVERDUE |

Full schema is at `http://localhost:8080/api/swagger-ui.html`.

## Frontend — quick start

```bash
cd frontend
npm install
npm start            # serves at http://localhost:4200
```

The dev server proxies to `http://localhost:8080/api` (configured in `src/environments/environment.ts`). CORS is already allowed from `localhost:4200` on the backend.

Production build:

```bash
npm run build
```

### Frontend structure

```
src/app/
├── app.component.ts        Shell with Bootstrap navbar + toast stack
├── app.routes.ts           Lazy-loaded standalone routes
├── core/
│   ├── models/             Book, Member, Transaction, PageResponse, IssueRequest
│   └── services/           BookService, MemberService, TransactionService, ToastService, errorInterceptor
├── shared/components/      ToastStackComponent, PaginationComponent
└── features/
    ├── dashboard/          High-level stats + quick actions
    ├── books/              List + form (create/edit)
    ├── members/            List + form (create/edit)
    └── transactions/       History list + Issue/Return console
```

Forms are reactive with field-level errors; HTTP errors are surfaced via toast through the `errorInterceptor`.

## Design notes

- Layered architecture: Controller → Service → Repository → JPA Entity.
- DTOs (`BookRequest`, `BookDto`, `MemberRequest`, `MemberDto`, `IssueRequest`, `TransactionDto`, `PageResponse`) keep entities off the wire.
- Soft delete on `Book` via `@SQLDelete` + `@Where(deleted=false)` so transaction history retains a stable book reference.
- `@Transactional` on every mutating service method.
- Issue/return atomically updates `availableCopies` with the transaction row in the same transaction.
- Indexes on `books(title, author, category)`, `members(name, status)`, `transactions(book_id, member_id, status, due_date)`.
- Profile-based config (`dev` → H2 + h2-console, `prod` → MySQL).
- Stateless API, ready to be fronted by any auth layer.

## Bonus features

- **Overdue fines**: `FineCalculator` charges a configurable per-day rate (`library.fine.per-day-cents`, default 50¢) and surfaces `fineCents` on every transaction DTO. The frontend shows it in the transactions list and in the return toast.
- **Caching**: `@EnableCaching` plus `@Cacheable("books"|"members")` on the `getById` reads, with `@CacheEvict` on every mutating method. Uses Spring's default in-memory `ConcurrentMapCacheManager`.
- **Audit logs**: every create/update/delete on books and members and every issue/return is recorded into `audit_logs` (migration `V2__audit_logs.sql`) by `AuditService` running in `REQUIRES_NEW`. Read via `GET /api/v1/audit-logs?entityType=Book`.
- **Tests**: `BookServiceTest`, `MemberServiceTest`, `FineCalculatorTest`, `TransactionServiceTest` cover the core paths and business rules.

## Extensibility hooks for future ERP integration

- Replace `BookRepository`/`MemberRepository` JPA-backed beans with a federation layer behind the same interface.
- Add a `domain-events` package and publish `BookIssuedEvent` / `BookReturnedEvent` from `TransactionService` for downstream ERP consumers (Spring `ApplicationEventPublisher`).
- Swap `FineCalculator` for a tiered/membership-aware strategy without touching `TransactionService`.

<img width="1901" height="858" alt="image" src="https://github.com/user-attachments/assets/a53aa800-2fea-41c3-b40d-1d1d22b58896" />
<img width="1908" height="843" alt="image" src="https://github.com/user-attachments/assets/04d33317-16a6-46f0-92e3-eb5ccc229d6a" />
<img width="1918" height="858" alt="image" src="https://github.com/user-attachments/assets/ba7419a9-753c-4735-a641-50a1f057f5fe" />
<img width="1918" height="867" alt="image" src="https://github.com/user-attachments/assets/9a8eb2a2-6b5d-4914-9ca7-0190537dde02" />
<img width="1902" height="842" alt="image" src="https://github.com/user-attachments/assets/87856905-07ab-41fa-ae09-f18760c10678" />




