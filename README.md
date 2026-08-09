# TokTickIT

TokTickIT is the Lab 1 starter for CPE334. It proves the full stack works as one vertical slice:

React UI -> Express REST API -> Prisma ORM -> PostgreSQL

## Tech stack

- **Frontend:** React, TypeScript, Vite, Bootstrap
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma
- **Testing:** Vitest, Supertest

## Repository structure

```text
toktickit/
  client/
    index.html
    public/
    src/
  server/
    prisma/
    tests/
  docs/
    lab-01/
      Lab1_Labsheet.md
      ai_use.md
      reviewer.md
  prisma.config.ts
  README.md
  tsconfig.json
```

## Project areas

- `client/` contains the React + Vite frontend.
- `server/` contains the Express + Prisma backend work.
- `docs/lab-01/` stores the lab sheet and submission documents.

## Local setup

### 1) Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2) Configure the backend

Create `server/.env` and set the database connection string required by Prisma:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 3) Run the frontend

```bash
cd client
npm run dev
```

### 4) Run checks

The client already defines these scripts:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

Backend scripts and lab tests should be added under `server/` as the lab is implemented.

## Lab documentation

- `docs/lab-01/ai_use.md` records AI usage and prompt notes.
- `docs/lab-01/reviewer.md` records peer review details.
- `server/tests/lab-01/` is reserved for Lab 1 API/UI test cases.

## Lab 1 acceptance summary

- `GET /api/health` returns `200` with `{ "status": "ok", "service": "TokTickIT API" }`
- `GET /api/categories` returns the seeded categories in a stable order
- the UI shows loading, success, and failure states
- the repository keeps the Lab 1 workflow, docs, and tests organized
