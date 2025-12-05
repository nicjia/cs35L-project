# cs35L-project

CS35L - Fall 2025 Group Project

Group Members:
Nicholas Jiang
Melis Fidansoy
Amadeu Behrend
Zachary Som

## Prerequisites
- Node.js (v18+ recommended)
- npm (or pnpm/yarn) — examples use `npm`
- MySQL server (local or remote)
- A terminal (macOS: zsh)

## Quick start (development)
1. Clone the repo:

```bash
git clone https://github.com/nicjia/task-manager
cd task-manager
```

2. Create the database (example name used below: task_manager). You can use either MySQL CLI or a GUI tool:

```bash
# using mysql CLI
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. Install server dependencies and create `.env` for the server:

```bash
# in repo root
cd server
npm install
# create .env (see example below)
```

4. Install client dependencies:

```bash
cd ../client
npm install
```

5. Start the backend and frontend in separate terminals (development):

Terminal A (server):

```bash
cd task-manager/server
npm start
```

Terminal B (client):

```bash
cd task-manager/client
npm run dev
```

By default the server runs on `http://localhost:3001` and the Vite dev server runs on `http://localhost:5174`.

## Environment variables (.env example)

Create a `.env` file inside the `server/` folder with the following (example):
```env
DB_USER=
DB_PASSWORD=
DB_NAME=task_manager
JWT_SECRET=
```

Notes:
- `DB_USER`, `DB_PASSWORD`, and `DB_NAME` must match your MySQL credentials and database name.
- `JWT_SECRET` should be a secure secret for signing tokens.

## Database setup

- The repo includes `server/schema.sql` — you can run this to create tables and seed data (if provided):

```bash
# from repo root
mysql -u $DB_USER -p $DB_NAME < server/schema.sql
```
The backend uses Sequelize and will also sync models at runtime (see `server/index.js`). 

## Running the Server
```bash
cd server
npm start
```

## Running the client
Development:
```bash
cd client
npm run dev
```

## Helpful commands

- Install server deps: `cd server && npm install`
- Install client deps: `cd client && npm install`
- Start server: `cd server && npm start`
- Start client dev: `cd client && npm run dev`
- Run DB schema: `mysql -u $DB_USER -p $DB_NAME < server/schema.sql`

Sequence Diagram for "Add Task" Feature:

<img width="756" height="792" alt="image" src="https://github.com/user-attachments/assets/9ab6086f-a015-4a60-a321-095952583bda" />


Entity-Relationship Diagram:

<img width="2244" height="2904" alt="image" src="https://github.com/user-attachments/assets/876b537b-89e9-4b40-bcd4-397445406b17" />

