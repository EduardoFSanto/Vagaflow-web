# VagaFlow Web

VagaFlow Web is the frontend for a job marketplace built to serve two distinct roles: candidates looking for opportunities and companies managing hiring workflows.

The focus of this version was to move beyond a basic interface and turn the product into a clearer, more structured experience. The application is split into role-based flows, with dedicated pages for job discovery, applications, company job management, and profile editing.

## What this frontend does

- Landing page with a concise product overview
- Authentication flow for sign in and account creation
- Role-aware dashboard for candidates and companies
- Job browsing, search, and filtering
- Application tracking for candidates
- Job posting and editing for companies
- Company applications inbox with status updates
- Profile management for both roles

## Frontend architecture

The interface is built with Next.js App Router and organized by feature, not by framework default.

- `app/` contains the routes and screens
- `components/` contains reusable UI and form components
- `services/` centralizes API calls and keeps pages thin
- `lib/api.ts` handles the HTTP client and token injection

The frontend relies on small service modules instead of scattering fetch logic across pages. That keeps the UI easier to maintain and makes the API contract more explicit.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Axios
- Sonner

## Product structure

The user experience is divided into two paths:

Candidate flow:

- Browse open positions
- Filter by contract type and search by company, role, or location
- View job details and apply
- Track submitted applications
- Edit candidate profile

Company flow:

- Manage posted jobs
- Create and update listings
- Add screening questions per vacancy
- Review incoming applications
- Update application status
- Edit company profile

## How it connects to the API

The frontend talks to the backend through `NEXT_PUBLIC_API_URL`.

If the variable is not set, it falls back to `http://localhost:3333`.

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` file if you need to point the app to a different backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Then open:

```bash
http://localhost:3000
```

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project notes

This frontend was built to support the product structure from the backend, including role-based access, job management, and application review. The main goal was to keep the interface clean while making the underlying workflow easy to follow.
