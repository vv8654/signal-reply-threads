# Overview

This is a **Signal Reply Threads Prototype** — an interactive demo showcasing a proposed "Reply Threads" feature for the Signal messaging app. The prototype simulates a Signal-like chat interface with iMessage-style inline reply threading: all messages (including replies) are visible in the main timeline with compact reply preview bubbles showing the original sender and a truncated snippet. Users can reply to messages via the composer (with a reply preview bar), and view full thread discussions in a right-side panel. The goal is to demonstrate how threading could reduce confusion in busy group chats.

## Threading Architecture (iMessage-style)

- **Inline replies**: All messages render in the main timeline. Replies show a compact preview bubble above the message with a colored accent bar, original sender name, and truncated text snippet.
- **Reply action**: Clicking "Reply" on a message sets the composer to reply mode with a preview bar showing who you're replying to. The sent message includes `replyToId`.
- **Thread panel**: Clicking "View Thread" opens a 380px right-side panel showing the root message and all chronological replies with a thread-specific composer.
- **Jump-to-original**: Tapping a reply preview bubble smooth-scrolls to and highlights the original message.
- **Flat threading**: Replies point to a single parent via `replyToId`. No nested threads — keeps UX simple.
- **Edge cases**: Deleted originals show "Original message unavailable" placeholder. Missing messages in view show toast feedback.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Overall Structure

The project follows a **monorepo pattern** with three main directories:

- `client/` — React frontend (SPA)
- `server/` — Express backend (API server)
- `shared/` — Shared schema definitions and types used by both client and server

## Frontend

- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin) with CSS variables for theming. The theme is dark-mode, Signal-inspired (custom Signal colors defined in `index.css`).
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives. Components live in `client/src/components/ui/`.
- **State Management / Data Fetching**: TanStack React Query for server state. No Redux or other global state library.
- **Animations**: Framer Motion for message and thread view animations.
- **Build Tool**: Vite with React plugin, path aliases (`@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`)
- **Key custom components**: `ChatInterface`, `ChatSidebar`, `MessageBubble`, `ThreadView` in `client/src/components/chat/`

## Backend

- **Runtime**: Node.js with TypeScript (compiled via `tsx`)
- **Framework**: Express 5
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Key endpoints**:
  - `GET /api/users` — list all users
  - `GET /api/chats` — list all chats with participants and last message
  - `GET /api/chats/:id` — single chat details
  - `GET /api/chats/:chatId/messages` — messages for a chat
  - `POST /api/chats/:chatId/messages` — send a new message
  - Thread replies are fetched via the storage layer's `getThreadReplies(messageId)` method
- **Dev mode**: Vite dev server is set up as middleware on the Express server (see `server/vite.ts`) for HMR
- **Production**: Client is built to `dist/public/` via Vite, server is bundled via esbuild to `dist/index.cjs`, static files served by Express

## Database

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod` for validation schema generation
- **Schema** (defined in `shared/schema.ts`):
  - `users` — id (varchar PK), name, color, isMe flag
  - `chats` — id (varchar PK), type (direct/group), name, color, initials, unreadCount
  - `chat_participants` — join table linking chats to users
  - `messages` — id, chatId, senderId, text, timestamp, replyToId (self-referencing FK for threads), isRead
- **Migrations**: Drizzle Kit with `drizzle-kit push` command (`npm run db:push`)
- **Seeding**: `server/seed.ts` populates demo data (users, chats, participants, messages) on first run if the database is empty
- **Connection**: `pg.Pool` using `DATABASE_URL` environment variable

## Storage Layer

- `server/storage.ts` defines an `IStorage` interface and a `DatabaseStorage` class implementation
- All database operations go through this storage abstraction
- Key methods: `getUsers()`, `getChats()`, `getMessagesByChat()`, `createMessage()`, `getThreadReplies()`

## Build System

- `script/build.ts` handles production builds — builds client with Vite, then bundles server with esbuild
- Server dependencies in an allowlist are bundled to reduce cold start times; others are externalized
- Dev: `npm run dev` starts the full-stack dev server with HMR
- Production: `npm run build` then `npm run start`

# External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable
- **Drizzle ORM + Drizzle Kit** — Database ORM and migration tooling
- **Radix UI** — Headless UI primitives (dialog, dropdown, tabs, tooltip, etc.)
- **TanStack React Query** — Server state management and caching
- **Framer Motion** — Animation library for UI transitions
- **shadcn/ui** — Pre-built component patterns using Radix + Tailwind
- **Wouter** — Lightweight client-side routing
- **date-fns** — Date formatting utilities
- **Zod** — Schema validation (used with drizzle-zod for insert schemas)
- **Replit plugins** (dev only): `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`
- **Google Fonts** — Inter and JetBrains Mono font families loaded via CDN