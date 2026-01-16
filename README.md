# AI Visibility Platform

A comprehensive monorepo for the AI SEO System, comprising execution engines, sales management, and a frontend dashboard.

## Structure

- **system-1-execution**: Core execution engines (scrapers, agents).
- **system-2-sales**: Sales and management backend (Node.js + PostgreSQL).
- **frontend-dashboard**: User interface for managing leads and system status.
- **shared-utils**: Shared configuration and utility libraries.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js (v18+)

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd ai-visibility-platform
    ```

2.  **Setup Environment Variables**:
    Copy `.env.example` to `.env` in `system-2-sales`:
    ```bash
    cp system-2-sales/.env.example system-2-sales/.env
    ```

3.  **Start Services**:
    Use Docker Compose to start the backend and database:
    ```bash
    docker-compose up -d
    ```
    This will start:
    - Postgres DB on port 5432
    - Sales Backend on port 3000

4.  **Install Dependencies**:
    If running locally without Docker for development:
    ```bash
    cd system-2-sales
    npm install
    npm start
    ```

## Deployment

### GitHub Actions
CI/CD pipelines are configured in `.github/workflows`:
- `ci.yml`: Runs on PRs to `main` (Linting, Tests).
- `deploy.yml`: Runs on push to `main` (Deploy to Cloudflare/Production).

### Database Migrations
Schema is located at `system-2-sales/src/db/schema.sql`.
When the Docker container starts, it initializes the DB with this schema (if the volume is empty).

## Architecture
- **Backend**: Node.js (Express/Fastify)
- **Database**: PostgreSQL
- **Frontend**: React/Vite (Planned)
- **Infrastructure**: Docker, Cloudflare Workers (Planned for API Gateway)
