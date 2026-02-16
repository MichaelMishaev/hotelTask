# Hotel Booking Platform

Full-stack hotel booking application built with **.NET 8** (Clean Architecture, CQRS) and **React 19** (TypeScript, Tailwind CSS v4).

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run the App

```bash
# Option 1: One command
./start.sh

# Option 2: Manual
docker compose up --build
```

**That's it.** The script builds everything, waits for services to be healthy, and opens the browser.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5288 |
| Swagger Docs | http://localhost:5288/swagger |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

### Stop

```bash
./stop.sh
# or
docker compose down
```

## Demo Users

| Name | Email | Password | Role |
|------|-------|----------|------|
| John Doe | john@example.com | guest123 | Guest |
| Jane Smith | jane@example.com | staff123 | Staff |
| Admin User | admin@example.com | admin123 | Admin |

## Architecture

**Clean Architecture** with 4 layers (inner layers never reference outer):

```
Domain (innermost) -> Application -> Infrastructure -> Api (outermost)
```

### Backend - .NET 8 Microservices

```
backend/
  src/
    Services/
      Booking/                          # Core booking service
        HotelBooking.Domain/            # Entities, Value Objects, Domain Events
        HotelBooking.Application/       # CQRS via MediatR, FluentValidation
        HotelBooking.Infrastructure/    # EF Core + PostgreSQL, JWT, Redis
        HotelBooking.Api/               # Controllers, Middleware, Swagger
      Pricing/                          # Dynamic pricing microservice
      Notification/                     # Email notification microservice
    Gateway/                            # YARP reverse proxy
    Shared/                             # Integration event contracts
  tests/
    HotelBooking.Domain.Tests/          # Pure unit tests
    HotelBooking.Application.Tests/     # Handler tests (mocked repos)
    HotelBooking.Infrastructure.Tests/  # EF Core integration tests
    HotelBooking.Api.IntegrationTests/  # Full HTTP pipeline tests
```

### Frontend - React 19 + TypeScript

```
frontend/
  src/
    components/                         # UI, Layout, Rooms, Bookings
    pages/                              # Login, Search, Booking, Dashboard
    hooks/                              # useAuth, useBooking, useRoomAvailability
    lib/                                # API client
  e2e/                                  # Playwright E2E tests
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 8, C#, EF Core, PostgreSQL |
| Patterns | Clean Architecture, CQRS (MediatR), Domain Events |
| Validation | FluentValidation (pipeline behavior) |
| Auth | Mock JWT with RBAC (Guest, Staff, Admin) |
| Caching | Redis |
| Messaging | RabbitMQ (inter-service events) |
| API Gateway | YARP reverse proxy |
| API Docs | Swagger/OpenAPI |
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| Frontend Features | PWA, Responsive (mobile-first), i18n-ready |
| Testing | xUnit + FluentAssertions (backend), Vitest + Testing Library (frontend), Playwright (E2E) |
| Containerization | Docker + docker-compose |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Authenticate (returns JWT) | Public |
| GET | /api/auth/users | List demo users | Public |
| GET | /api/rooms/availability?checkIn=date&checkOut=date | Search available rooms | Required |
| POST | /api/bookings | Create a booking | Required |
| GET | /api/bookings/{id} | Get booking details | Required |
| PUT | /api/bookings/{id} | Update booking dates | Required |
| DELETE | /api/bookings/{id} | Cancel booking (soft delete) | Required |
| PATCH | /api/bookings/{id}/status | Update booking status | Staff/Admin |
| GET | /api/guests/{id}/bookings | Get guest's bookings | Required |

## Key Design Decisions

- **Static pricing**: All rooms $100/night, server-authoritative (never trust client)
- **Booking state machine**: Confirmed -> CheckedIn -> CheckedOut, Confirmed -> Cancelled
- **Soft deletes only**: Bookings are cancelled, never physically deleted
- **Audit trail**: All changes logged to AuditLog table (append-only, via Domain Events)
- **RBAC**: Guests see own bookings, Staff/Admin manage all
- **CQRS**: Commands for writes, Queries for reads, dispatched via MediatR
- **FluentValidation pipeline**: Auto-validates all requests before handlers execute
- **Error responses**: RFC 7807 ProblemDetails format
- **Database**: PostgreSQL via Npgsql (EF Core Code First with migrations)

## Running Tests

```bash
# Backend tests (69 tests: unit + integration)
docker compose exec backend dotnet test /src/HotelBooking.sln

# Frontend unit tests (21 tests)
cd frontend && npm test

# E2E tests (requires running app)
cd frontend && npx playwright test
```

## Database Schema

| Table | Key Columns |
|-------|-------------|
| Rooms | Id, RoomNumber, RoomType (Standard/Deluxe/Suite), Status |
| Guests | Id, FirstName, LastName, Email, Phone |
| Bookings | Id, GuestId, RoomId, CheckIn, CheckOut, Status, TotalAmount |
| AuditLog | Id, Action, EntityType, EntityId, UserId, Timestamp |
