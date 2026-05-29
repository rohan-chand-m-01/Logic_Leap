# Heapify

A high-performance, enterprise-grade digital campus ecosystem architecture built to orchestrate and unify modern educational institutions. Moving beyond legacy LMS boundaries, Heapify leverages a robust monorepo to deliver low-latency real-time communication, intelligent vector-based tutor workflows, and deep analytical insights for students, faculty, and administrators.

## 1. Core Architecture & Philosophy

Heapify is built on the principle of extreme responsiveness, complete type safety, and real-time operational telemetry. By combining a highly optimized React client with an Express-based Node.js runtime and PostgreSQL databases, the platform scales efficiently across multiple workflows, including timetabling, leave approvals, student academic risk profiling, and AI-driven tutoring.

## 2. Key Platform Capabilities

| Capability | Technical Description |
| :--- | :--- |
| **Unified Portals** | Multi-role secure dashboard and access control tailored specifically for Students, Faculty, and Administrators. |
| **AI Tutor Engine** | Doubt clarification, explanations, and quick quizzes utilizing the Groq SDK and Qdrant vector-based retrieval. |
| **Real-time Telemetry** | High-throughput campus operations analytics pipelines and automated predictive at-risk student monitoring. |
| **Algorithmic Scheduler** | Automated, conflict-free school timetable generator maximizing resource and classroom space utilization. |
| **Duplex Communications** | Live Socket.io-powered chats and class channels, featuring automated offensive keyword filtering. |
| **Resource & Prep Engine** | Decentralized curriculum material indexer featuring document/PDF analysis and pre-class student assignments. |

## 3. Technology Stack

### Client Layer
* **Framework:** React 19 and Vite
* **State Management:** Zustand
* **Query Caching:** TanStack React Query v5
* **Styling & Animations:** Tailwind CSS 4 and Framer Motion
* **Analytics Visualization:** Recharts
* **Type Safety:** Zod and React Hook Form

### Service Layer
* **Runtime:** Node.js, Express, and TypeScript (Strict Mode)
* **Database & Caching:** PostgreSQL and Redis
* **Vector Intelligence:** Qdrant (RAG workflow)
* **Concurrency:** Socket.io for bi-directional event streaming
* **LLM Orchestration:** Groq SDK (Llama 3.3 models)

## 4. Getting Started

Follow these steps to initialize your local development environment.

### Prerequisites
* Node.js v18.x or higher
* npm v9.x or higher
* Docker Desktop (or standalone Postgres, Redis, and Qdrant instances)

### Installation
Clone the repository and install all dependencies from the root directory:
```bash
npm install
```

### Environment Configuration
Configure your credentials by copying the example files:
```bash
# Set up server and infrastructure configuration
cp .env.example .env

# Set up web app configuration
cp apps/web/.env.example apps/web/.env
```

### Database Initialization & Seed
1. Ensure your Postgres, Redis, and Qdrant services are active (a `docker-compose.yml` file is provided for quick setup).
2. Initialize tables and populate comprehensive seed data (this sets up initial mock classes, timetables, and roles):
```bash
npx ts-node apps/server/src/scripts/init-db.ts
```

### Run Locally
Ignite both the backend Express server and Vite frontend client concurrently:
```bash
npm run dev
```

The services will boot up at:
* **Frontend Portal:** http://localhost:5173
* **Backend API Gateway:** http://localhost:5000

## 5. Seeded Accounts for Evaluation

You can log in and test all role-specific features and dashboards using these preloaded accounts:

* **Administrator Portal**
  * **Email:** admin@heapify.edu
  * **Password:** Admin@1234

* **Teacher / Faculty Portal**
  * **Email:** teacher1@heapify.edu
  * **Password:** Admin@1234

* **Student Portal**
  * **Email:** student1@heapify.edu
  * **Password:** Admin@1234

## 6. Developer CLI Commands

Manage the workspace from the root folder:

* `npm run dev` : Bootstraps the server and client in development watch mode.
* `npm run build` : Compiles and minifies assets for production deployment.
* `npm run migrate --workspace=apps/server` : Executes pending database migrations.
* `npm run smoke:campus-day --workspace=apps/server` : Runs a comprehensive end-to-end API scenario check.

## 7. Engineering Team

Architected, designed, and engineered by:

* **Rohan Chand M**
* **Akash Biswas**
* **Samarth Sharma**
* **Venkatesh Reddy**
