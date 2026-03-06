# Signal Reply Threads

  An interactive prototype demonstrating **iMessage-style reply threading** for Signal messenger. Built as a full-stack web application with a Signal-inspired dark UI, real-time messaging, and persistent data.

  ## The Problem

  Group chats on Signal get chaotic fast. When multiple conversations overlap, there's no way to follow who's responding to what. Messages pile up and context gets lost.

  ## The Solution

  This prototype adds **inline reply threading** — inspired by how iMessage handles replies — so every message stays visible in the main timeline while still showing its conversational context.

  ![Signal Reply Threads](https://img.shields.io/badge/Signal-Reply_Threads-3A76F0?style=for-the-badge&logo=signal&logoColor=white)

  ## Features

  ### Reply Threading (iMessage-style)
  - **Inline replies** — All messages, including replies, appear in the main timeline
  - **Reply preview bubbles** — Compact bubble above each reply showing the original sender name, colored accent bar, and a truncated text snippet
  - **Composer reply mode** — Click "Reply" on any message to enter reply mode with a preview bar above the input
  - **Thread panel** — Click "View Thread" to open a 380px side panel showing the root message and all replies
  - **Jump to original** — Tap any reply preview bubble to smooth-scroll to and highlight the original message

  ### Messaging
  - Send and receive messages in direct and group conversations
  - Emoji reactions (👍 ❤️ 😂 😮 😢 😡) with per-user tracking
  - Voice note recording with timer interface
  - File and media attachments
  - Message forwarding, pinning, copying, and deletion
  - In-chat search

  ### Calls & Stories
  - Voice and video call UI with ringing/connecting states
  - Local camera preview (PIP) using `getUserMedia`
  - Signal Stories with text-based story creation and auto-advancing viewer

  ### Signal Security UX
  - End-to-end encryption banners and indicators throughout
  - Safety Number verification dialog
  - Disappearing messages configuration
  - Contact blocking

  ### Group Management
  - Create new groups with selected participants
  - Group name, initials, and member management
  - Conversation settings panel

  ## Tech Stack

  | Layer | Technology |
  |-------|-----------|
  | Frontend | React 19, TypeScript, Tailwind CSS v4 |
  | UI Components | shadcn/ui, Radix UI |
  | Animations | Framer Motion |
  | Routing | Wouter |
  | State | TanStack React Query |
  | Backend | Express 5, Node.js |
  | Database | PostgreSQL, Drizzle ORM |
  | Validation | Zod, drizzle-zod |
  | Build | Vite, esbuild |

  ## Project Structure

  ```
  ├── client/                  # React frontend
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── chat/        # Core chat components
  │   │   │   │   ├── ChatInterface.tsx
  │   │   │   │   ├── ChatSidebar.tsx
  │   │   │   │   ├── MessageBubble.tsx
  │   │   │   │   ├── ThreadView.tsx
  │   │   │   │   ├── CallScreen.tsx
  │   │   │   │   └── ...
  │   │   │   └── ui/          # shadcn/ui components
  │   │   ├── lib/             # API client, utilities
  │   │   └── pages/           # Route pages
  │   └── index.html
  ├── server/                  # Express backend
  │   ├── routes.ts            # API endpoints
  │   ├── storage.ts           # Database operations
  │   ├── seed.ts              # Demo data
  │   └── index.ts             # Server entry
  ├── shared/
  │   └── schema.ts            # Drizzle schema + Zod types
  └── package.json
  ```

  ## Data Model

  ```
  users ──┐
          ├── chat_participants ── chats
          │
          └── messages ──── reactions
                │
                └── replyToId (self-referencing FK for threading)
  ```

  Threading uses a flat model: each reply points to a single parent via `replyToId`. No nested threads — keeps the UX simple and Signal-appropriate.

  ## API Endpoints

  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | GET | `/api/users` | List all users |
  | GET | `/api/chats` | List chats with participants and last message |
  | GET | `/api/chats/:id` | Single chat details |
  | GET | `/api/chats/:chatId/messages` | Messages for a chat |
  | POST | `/api/chats/:chatId/messages` | Send a new message |
  | GET | `/api/messages/:messageId/thread` | Get thread replies |
  | POST | `/api/messages/:messageId/reactions` | Add/toggle reaction |
  | POST | `/api/chats` | Create a new chat |

  ## Running Locally

  ```bash
  # Install dependencies
  npm install

  # Set up the database
  # Requires a PostgreSQL instance with DATABASE_URL environment variable
  npm run db:push

  # Start development server (frontend + backend with HMR)
  npm run dev

  # Production build
  npm run build
  npm run start
  ```

  ## Design Decisions

  - **Inline over hidden replies** — First version hid replies from the timeline (Slack-style). Switched to iMessage-style inline replies because in a messaging app, you want to see everything in one place.
  - **Side panel over overlay** — Thread view is a 380px panel alongside the chat, not a full-screen takeover. Users can reference the main conversation while reading a thread.
  - **Flat threading** — Single-level `replyToId` instead of recursive nesting. Matches how messaging apps actually work and avoids deep thread complexity.
  - **Real database** — PostgreSQL with Drizzle ORM, not localStorage or mock data. All messages persist across sessions.

  ## License

  MIT
  