# Interview Guide Documentation - Design Document

**Date**: 2026-03-08
**Purpose**: Create comprehensive backend architecture documentation for interview preparation
**Audience**: Interview candidates explaining the system to senior technical interviewers

---

## Requirements

Create documentation that:
1. Explains the backend architecture (Clean Architecture, CQRS, microservices)
2. Walks through code flow from HTTP request to database commit
3. Shows data integrity guarantees with actual code snippets
4. Demonstrates understanding of trade-offs and alternatives
5. Emphasizes RBAC, transactions, pricing integrity, and audit trail

**Target interview level**: Senior Full-Stack + Architecture Review

---

## Approach Chosen: Flow-Based Documentation

**Decision**: Follow a booking creation from start to finish, showing every layer, every decision point, and the code that makes it work.

**Why flow-based**:
- Easy to walk an interviewer through verbally
- Shows complete system understanding (not just isolated pieces)
- Natural narrative structure ("when a user books a room, here's what happens")
- Demonstrates full-stack knowledge (HTTP → business logic → database)

**Alternatives considered**:
1. **Problem-Solution structure** - Organized by problems solved (double-booking, RBAC leakage)
2. **Architecture-first** - Layer-by-layer deep dive (Domain, Application, Infrastructure, API)

**Why we chose flow-based over alternatives**:
- Problem-Solution is great for showing judgment, but less narrative
- Architecture-first is good for "explain your layers" questions, but harder to follow end-to-end
- Flow-based combines both: shows architecture AND problem-solving in context

---

## Design Structure

### Two Files

**README.md Update**:
- High-level overview section "Backend Architecture Deep Dive"
- ASCII diagram showing 4 data integrity guarantees
- Quick summary of Clean Architecture, CQRS, Domain Events
- 7-step booking creation flow (summary)
- Link to detailed guide

**docs/INTERVIEW_GUIDE.md** (New):
- Complete 7-step walkthrough with code snippets
- Data Integrity Guarantees section (4 guarantees explained)
- RBAC & Authorization Flow
- Audit Trail Implementation
- Microservices Communication
- Key Trade-offs & Decisions (6 major decisions with reasoning)

---

## Content Sections

### 1. Booking Creation Flow (7 Steps)

Each step shows:
- **Layer**: Which Clean Architecture layer
- **File**: Actual file path in codebase
- **Code Snippet**: Real C# code (20-50 lines)
- **What happens**: Explanation of behavior
- **Data integrity concern**: Which invariant this enforces
- **Why this way**: Design reasoning
- **Trade-off**: What we gain vs sacrifice

**Steps**:
1. HTTP Request arrives at Controller
2. JWT Authentication & Authorization (middleware)
3. Validation Pipeline (FluentValidation)
4. CQRS Handler - Business Logic & Data Integrity
5. Domain Entity raises Event
6. SaveChanges triggers Event Dispatch (interceptor)
7. Audit Log created via Event Handler

---

### 2. Data Integrity Guarantees

Four critical guarantees with code:

1. **No Double Bookings (INV-BOOK-001)**
   - Problem: Race conditions in concurrent requests
   - Solution: Serializable transaction + overlap query
   - Code: Transaction isolation, availability check
   - Trade-off: Lower throughput vs guaranteed correctness

2. **RBAC Data Isolation (INV-RBAC-001)**
   - Problem: Guest sees other guests' data
   - Solution: Filter queries by ClaimsPrincipal in handler
   - Code: Authorization check in handler
   - Trade-off: Repeated checks vs centralized EF filter

3. **Server-Authoritative Pricing (INV-BOOK-002)**
   - Problem: Client sends malicious totalAmount
   - Solution: Server calculates, ignores client
   - Code: Price calculation in handler
   - Trade-off: None (non-negotiable)

4. **Immutable Audit Trail (INV-DATA-003)**
   - Problem: Audit log modified to hide actions
   - Solution: Append-only table + domain events + PostgreSQL trigger
   - Code: Event handler, trigger SQL
   - Trade-off: Storage grows forever vs compliance

---

### 3. RBAC & Authorization Flow

Three-layer authorization:
1. JWT Middleware (API layer) - validates token
2. [Authorize] attribute (Controllers) - role check
3. Handler RBAC (Application layer) - business rules

Example: Guest tries to access another guest's bookings
- Shows request/response flow
- 403 Forbidden with detailed message
- Role matrix table (Guest/Staff/Admin permissions)

---

### 4. Microservices Communication

- Architecture diagram (Booking → RabbitMQ → Notification)
- Event flow: Booking confirmation email
- Code: Integration event publishing, subscription
- YARP gateway configuration
- Domain Events vs Integration Events comparison

---

### 5. Key Trade-offs & Decisions

Six major decisions explained:

1. **Clean Architecture Complexity**
   - Decision, alternatives, why, gains, sacrifices
   - "Would I change it?" analysis

2. **CQRS with MediatR**
3. **FluentValidation Pipeline vs DataAnnotations**
4. **PostgreSQL vs SQL Server**
5. **Serializable Isolation vs Optimistic Concurrency**
6. **Domain Events vs Manual Audit Writes**

Each includes:
- What we chose
- What we considered
- Why we chose it
- What we gain
- What we sacrifice
- Would we change it for production (with specifics)

---

## Interview Talking Points

Key phrases to use in interview:

- "I chose Serializable isolation because double-bookings are catastrophic - I'd rather sacrifice 30% throughput than risk financial loss."
- "Domain events make the audit trail impossible to forget - the interceptor runs automatically after every SaveChanges."
- "RBAC filtering happens at the Application layer so it's explicit and testable - I considered EF Global Query Filters but chose visibility over magic."
- "Clean Architecture is more ceremony, but the testability and framework independence are worth it for a long-lived system."
- "I'd add a Transactional Outbox pattern for production to guarantee 'exactly once' audit log entries."

---

## Success Criteria

Documentation is successful if:
- ✅ Can walk interviewer through booking creation in 5-10 minutes
- ✅ Can explain each of 4 data integrity guarantees with code
- ✅ Can articulate trade-offs for major decisions
- ✅ Demonstrates senior-level architectural thinking
- ✅ Shows awareness of production improvements (outbox pattern, optimistic concurrency)

---

## Implementation Notes

**Code snippets**:
- Real C# code from actual files (not pseudocode)
- 20-50 lines per snippet (readable but complete)
- Include comments highlighting key lines

**ASCII diagrams**:
- Flow diagrams for booking creation
- Layer architecture diagram
- Authorization flow

**Formatting**:
- Code blocks with syntax highlighting
- Tables for comparisons (trade-offs, role matrix)
- Callout sections for key points

---

**Total length**: ~8000 words (30-minute read, 5-10 minute skim)
