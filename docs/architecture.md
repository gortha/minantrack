# MinanTrack Architecture

## 1. Overview

MinanTrack is designed as a layered, modular application with a simple deployment model and a clear evolution path. For v1, the recommended architecture is a modular monolith backend under .NET Minimal API, paired with a Next.js front end and PostgreSQL persistence. This approach is easier to ship quickly, easier to operate in Kubernetes, and scalable enough for the product’s first trajectory.

## 2. Architectural Principles

- keep the product understandable for a small team;
- separate domain responsibilities behind clear modules;
- prioritize traceability and status clarity over over-engineering;
- containerize everything for provider-independent Kubernetes deployment;
- ensure observability from day one.

## 3. Components

### Frontend

- Next.js 14+ with TypeScript
- App Router for page and route structure
- MUI for design system and components
- TanStack Query for API data fetching and cache management

### Backend

- ASP.NET Core Minimal API on .NET 9
- modular domain folders for parcels, users, routes, pricing, notifications, admin
- REST endpoints for operations and reads
- structured API responses with consistent error handling

### Data Layer

- PostgreSQL for transactional persistence
- Redis for caching and temporary session metadata if needed
- Dockerized local development and Kubernetes deployment

### Deployment

- Docker for container packaging
- Kubernetes manifests for deployment, service, ingress, and config
- environment variables for provider-specific settings
- separate config for dev, staging, and prod

## 4. Recommended module layout

```text
src/
  back/
    MinanTrack.Api/
      Program.cs
      appsettings.json
      Features/
        Parcels/
        Users/
        Routes/
        Pricing/
        Notifications/
        Admin/
      Shared/
        Models/
        Services/
  front/
    app/
    components/
    lib/
    styles/
  k8s/
    namespace.yaml
    backend-deployment.yaml
    backend-service.yaml
    frontend-deployment.yaml
    frontend-service.yaml
    ingress.yaml
```

## 5. Domain Boundaries

### Parcel domain
- parcel registration
- milestone updates
- delivery status timeline
- parcel lookup by tracking code

### Routing domain
- route definitions
- agent assignment
- status filters and operational visibility

### Pricing domain
- quote estimates
- destination rules
- delivery and service fee models

### Notification domain
- delivery alerts
- exception messaging
- escalation flow

### Admin domain
- role-based operations
- user management
- operational summaries

## 6. API Design

The backend will expose predictable REST resources:

- GET /api/parcels/{id}
- GET /api/parcels/track/{code}
- POST /api/parcels
- PATCH /api/parcels/{id}/status
- GET /api/routes
- POST /api/pricing/estimate
- GET /api/admin/dashboard

All API responses should use consistent JSON envelopes and typed status codes for success, validation, and server errors.

## 7. Frontend Interaction Model

The React/Next.js app will use a mobile-first dashboard approach:

- package tracking page;
- status timeline screen;
- quote and estimate form;
- admin dashboard with active routes and exceptions;
- responsive cards and forms via MUI.

TanStack Query will manage the communication with the API and provide cache invalidation after status updates.

## 8. Data Model (Core Entities)

### User
- id
- name
- email
- role
- createdAt

### Parcel
- id
- trackingCode
- senderId
- recipientId
- origin
- destination
- status
- createdAt
- updatedAt

### Route
- id
- name
- agentId
- status
- createdAt

### ShipmentEvent
- id
- parcelId
- type
- description
- occurredAt
- actorId

## 9. Non-Functional Requirements

- API latency under 300 ms for standard read operations in local validation;
- health checks for service readiness and liveness;
- structured logs for tracking status updates and operational failures;
- Kubernetes-ready manifests for reproducible deployment;
- clear separation of environment configuration.

## 10. Deployment Strategy

The recommended deployment model is:

- backend container in Kubernetes Deployment;
- frontend container in Kubernetes Deployment;
- service layer exposing internal and public endpoints;
- ingress for public access;
- environment config via ConfigMap and Secrets.

This makes the project portable across providers such as Azure, AWS, GCP, or on-prem clusters without changing the application architecture.

## 11. Why this architecture

A modular monolith keeps the first version easy to implement while preserving a strong domain boundary. It yields a cleaner path than a full microservices system at launch and reduces the operational overhead that would slow down the early product. The same structure can evolve into a more distributed architecture later if the business grows.
