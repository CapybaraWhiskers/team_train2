# Attendance & Daily Report Management System

This project is a sample corporate attendance management system. It includes a backend API using Node.js/Express, a static frontend served via nginx, and PostgreSQL database. All components run locally via Docker Compose.

## Local Setup

1. Install Docker and Docker Compose.
2. Run migrations manually on first start:
   ```bash
   docker compose up db -d
   # Linux/Mac
   docker compose exec -T db psql -U postgres -d attendance < backend/migrations/001_create_tables.sql
   ```
   PowerShell does not support the `<` redirection syntax with `docker compose exec`,
   so pipe the file content instead:
   ```powershell
   # PowerShell
   Get-Content backend/migrations/001_create_tables.sql | docker compose exec -T db psql -U postgres -d attendance
   ```
3. Start the stack:
   ```bash
   docker compose up
   ```
4. Access the frontend at <http://localhost:8080> and API at <http://localhost:3000>.

Run tests:
```bash
cd backend
npm install
npm test
```

## VM Deployment

1. Create an Azure VM (Linux recommended) and install Docker.
2. Clone this repository to the VM.
3. Ensure database port `5432` is firewalled to localhost only.
4. Run the same `docker compose up` command.
5. Configure environment variables for Microsoft Entra ID in `docker-compose.yml`.
6. Update the VM regularly using system package manager (e.g., `apt update && apt upgrade`).

Migration scripts are located in `backend/migrations/`.

## Architecture

ER Diagram and sequence diagram are located in the `docs/` folder.

## CI/CD (Optional)

A GitHub Actions workflow (`.github/workflows/nodejs.yml`) is provided for those who want to challenge integrating CI/CD.
