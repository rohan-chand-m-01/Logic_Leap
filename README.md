<div align="center">
  <!-- 3D Planet and Stars Header -->
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" style="border-radius: 20px;" />

  <br /><br />
  
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Ringed%20Planet.png" alt="Planet" width="120" style="margin-right: 20px;" />
  <img src="https://i.postimg.cc/KvH9n2Xd/b37b5896a527409cb4ac3ad6ba0904a2-removebg-preview.png" alt="Heapify Logo" width="200" />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="120" style="margin-left: 20px;" />
  
  <p>
    <a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=600&size=26&pause=1000&color=00FFFF&center=true&vCenter=true&width=800&lines=Heapifying+the+Education+System;Exploring+the+Campus+Universe;A+3D+Digital+Ecosystem;Next-Gen+Planetary+Scale" alt="Typing SVG" /></a>
  </p>
  
  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" /></a>
    <a href="https://qdrant.tech/"><img src="https://img.shields.io/badge/Qdrant-000000?style=for-the-badge&logo=qdrant&logoColor=white" alt="Qdrant" /></a>
  </p>

  <p>
    <b>A modern, high-performance digital campus ecosystem spanning the cosmos.</b>
  </p>
</div>

<!-- 3D Star Divider -->
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%">

<br />

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Milky%20Way.png" alt="Milky Way" width="30" /> 1. Abstract

**Heapify** is an enterprise-grade digital ecosystem built to orchestrate and unify the operations of modern educational institutions. Moving beyond legacy boundaries, it leverages a robust microservices-inspired monorepo to deliver low-latency real-time communication, intelligent vector-based tutor workflows, and deep analytical insights for students, faculty, and administrators.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%">

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Satellite.png" alt="Satellite" width="30" /> 2. Platform Capabilities

| Capability | Description |
| :--- | :--- |
| **Unified Portals** | Role-based access control and tailored interfaces for Students, Faculty, and Administration. |
| **AI Tutor Engine** | Context-aware learning assistance powered by Groq and Qdrant vector retrieval. |
| **Real-time Telemetry** | High-throughput analytics pipeline for campus operations and student performance tracking. |
| **Algorithmic Scheduling** | Automated, conflict-free timetable generation maximizing resource utilization. |
| **Synchronous Comms** | WebSockets-based infrastructure for instant messaging and real-time collaboration. |
| **Predictive Risk Engine** | Advanced data modeling to identify at-risk students and recommend interventions. |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%">

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Flying%20Saucer.png" alt="Saucer" width="30" /> 3. System Architecture

The project is structured as a modern monorepo, separating concerns between a highly reactive client and a scalable server layer.

### Client Layer (Web)
- **Core:** React 19, Vite
- **State & Data:** Zustand, React Query
- **UI/UX:** Tailwind CSS 4, Framer Motion, Recharts
- **Type Safety:** Zod, React Hook Form

### Service Layer (Server)
- **Runtime:** Node.js, Express
- **Language:** TypeScript (Strict Mode)
- **Persistence:** PostgreSQL (Relational), Redis (Transient/Cache)
- **Vector Intelligence:** Qdrant (RAG workflows)
- **Concurrency:** Socket.io for duplex event streaming
- **LLM Provider:** Groq SDK

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%">

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Shooting%20Star.png" alt="Star" width="30" /> 4. Initialization Guide

### Environment Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- PostgreSQL (v15.x)
- Redis (v7.x or Upstash Serverless)
- Qdrant (Local Docker or Cloud instance)

### Installation

Clone the repository and install dependencies from the root directory:

```bash
npm install
```

### Configuration

Duplicate the environment templates and populate them with your infrastructure credentials:

```bash
# Root environment
cp .env.example .env

# Web environment
cp apps/web/.env.example apps/web/.env
```

*Required Credentials:*
- **Groq API Key:** For language model inferences.
- **Cloudinary URL:** For decentralized media asset management.
- **Redis Connection String:** For high-speed caching and session states.

### Execution

Initialize the local database, execute migrations, and spin up the development environment:

```bash
# Optional: Spin up local infra dependencies via Docker
docker compose up -d

# Execute database schemas and migrations
npm run migrate --workspace=apps/server

# Ignite the local development server (Client + Server concurrently)
npm run dev
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%">

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Comet.png" alt="Comet" width="30" /> 5. Development CLI

- `npm run dev` : Bootstraps the complete monorepo in development mode.
- `npm run build` : Compiles and minifies assets for production deployment.
- `npm run migrate --workspace=apps/server` : Executes pending database migrations.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%">

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Astronaut.png" alt="Astronaut" width="30" /> 6. Engineering Team

Architected and engineered by:

<table align="center" style="border-collapse: collapse; border: none;">
  <tr style="border: none;">
    <td align="center" width="200" style="border: none;">
      <a href="https://github.com/rohan-chand-m-01">
        <img src="https://github.com/rohan-chand-m-01.png" width="120px;" alt="Rohan Chand M" style="border-radius: 50%; box-shadow: 0 0 15px #00FFFF; border: 3px solid #00FFFF; padding: 2px;" />
        <br />
        <b style="font-size: 16px; color: #00FFFF;">Rohan Chand M</b>
      </a>
      <br />
      <i style="color: #64748B;">Lead Architect</i>
    </td>
    <td align="center" width="200" style="border: none;">
      <a href="https://github.com/Code-mafia2">
        <img src="https://github.com/Code-mafia2.png" width="120px;" alt="Akash Biswas" style="border-radius: 50%; box-shadow: 0 0 15px #8B5CF6; border: 3px solid #8B5CF6; padding: 2px;" />
        <br />
        <b style="font-size: 16px; color: #8B5CF6;">Akash Biswas</b>
      </a>
      <br />
      <i style="color: #64748B;">Full-Stack Engineer</i>
    </td>
    <td align="center" width="200" style="border: none;">
      <a href="https://github.com/samarthsharma77">
        <img src="https://github.com/samarthsharma77.png" width="120px;" alt="Samarth sharma" style="border-radius: 50%; box-shadow: 0 0 15px #EC4899; border: 3px solid #EC4899; padding: 2px;" />
        <br />
        <b style="font-size: 16px; color: #EC4899;">Samarth Sharma</b>
      </a>
      <br />
      <i style="color: #64748B;">AI Integrations Lead</i>
    </td>
    <td align="center" width="200" style="border: none;">
      <a href="https://github.com/VenkateshReddy007">
        <img src="https://github.com/VenkateshReddy007.png" width="120px;" alt="Venkatesh Reddy" style="border-radius: 50%; box-shadow: 0 0 15px #10B981; border: 3px solid #10B981; padding: 2px;" />
        <br />
        <b style="font-size: 16px; color: #10B981;">Venkatesh Reddy</b>
      </a>
      <br />
      <i style="color: #64748B;">UI/UX Developer</i>
    </td>
  </tr>
</table>

<br />

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="80px" style="object-fit: cover; border-radius: 20px;" />
  <br /><br />
  <i>Heapify — Building the future of education across the universe.</i>
</div>
