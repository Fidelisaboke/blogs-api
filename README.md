# Blogs API

## Repository Overview

The Blogs API is a robust, production-ready backend service built with Node.js and TypeScript. It follows a layered architecture, separating concerns across controllers, services, and a persistent data layer. The system features a centralized response and error handling mechanism, multi-tenant organization support via Better Auth, and schema-based validation to ensure data integrity.

Key features include:

  * **Layered Architecture:** Clear separation between HTTP logic, business services, and database schemas.
  * **Standardized Responses:** Unified API response structure for consistency across all endpoints.
  * **Advanced Authentication:** Integration with Better Auth supporting social OAuth (GitHub, Google) and organizational contexts.
  * **Type-Safe ORM:** Leveraging Drizzle ORM for performant, type-safe PostgreSQL interactions.

## Table of Contents

1.  [Tech Stack](#tech-stack)
2.  [Setup and Installation](#setup-and-installation)
      * [Pre-requisites](#pre-requisites)
      * [Setup Instructions](#setup-instructions)
3.  [Basic Usage](#basic-usage)
4.  [Project Structure](#project-structure)

## Tech Stack

  * **Runtime:** Node.js
  * **Language:** TypeScript
  * **Framework:** Express.js (v5)
  * **Database:** PostgreSQL
  * **ORM:** Drizzle ORM
  * **Authentication:** Better Auth
  * **Validation:** Zod
  * **Logging:** Pino
  * **Mailing:** Resend & React Email

## Setup and Installation

### Pre-requisites

Ensure you have the following installed on your local machine:

  * **Node.js** (v20 or higher)
  * **pnpm** (Package Manager)
  * **Docker & Docker Compose** (For local database orchestration)
  * **PostgreSQL** (If running outside of Docker)

### Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Fidelisaboke/blog-api.git
    cd blog-api
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Environment Configuration:**
    Copy the example environment file and update the values with your credentials.

    ```bash
    cp .env.example .env
    ```

4.  **Database Setup:**
    Start the PostgreSQL container using Docker Compose:

    ```bash
    docker-compose up -d
    ```

5.  **Run Migrations:**
    Push the current schema to your database instance:

    ```bash
    pnpm db:push
    ```

## Basic Usage

### Running the Development Server

Start the server with hot-reloading enabled via `tsx`:

```bash
pnpm dev
```

The server will be accessible at `http://localhost:3000`

### Production Build

To compile the TypeScript source to JavaScript and run the production build:

```bash
pnpm build
pnpm start
```

### Database Management

To inspect your data locally using a GUI:

```bash
pnpm db:studio
```

## Project Structure

The project follows a modular structure to ensure high maintainability and ease of testing.

```text
.
├── drizzle/              # Generated SQL migrations and schema snapshots
├── src/
│   ├── app.ts            # Application entry point and middleware assembly
│   ├── controllers/      # Request handlers (Inheriting from BaseController)
│   ├── db/               # Database connection and Drizzle schema definitions
│   ├── lib/              # Core libraries (Auth, Logger, Standardized Response)
│   ├── middleware/       # Express middlewares (Auth, Error Handling, Validation)
│   ├── routes/           # API route definitions
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # Business logic layer
│   └── types/            # Global TypeScript interfaces and declarations
├── docker-compose.yaml   # Local infrastructure orchestration
├── drizzle.config.ts     # Drizzle ORM configuration
├── tsconfig.json         # TypeScript compiler configuration
└── package.json          # Project metadata and dependencies
```

roadmap.sh Project URL: https://roadmap.sh/projects/blogging-platform-api
