# AI Chat Client

A React-based AI Chat application offering a interface with markdown support, and chat history management.

## Prerequisites

- Node.js
- npm

## Setup & Running Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and update the values.

   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will differ at http://localhost:5173 (default Vite port).

## Production Build

Build the project for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# Technical Documentation

## Technology Stack (Frontend)

- React 19 + TypeScript — Component model + type safety without over-abstracting; easy to keep chat, routing, and socket code readable under time pressure.
- Vite (rolldown-vite) — Fast dev/build, minimal config, works well with modern TS/React; nothing custom beyond aliasing.
- React Router 7 — Simple routing split between auth flows and chat layout; avoids bringing in any global “app shell” framework.
- Zustand — Centralized chat state, socket connection state, and progress tracking without Redux boilerplate; lets the WebSocket client live outside React while still driving UI updates.
- Socket.IO client — Handles WebSocket transport, reconnection, and event names (`message:progress`, `message:completed`, etc.) so we don’t hand-roll reconnect/backoff/error handling.
- Axios — REST API client for auth, chat CRUD, and message history; per-request timeouts on long-running message endpoints.
- TailwindCSS 4 + Radix UI + custom components — Layout, theming, and accessible primitives for chat bubbles, inputs, dialogs; easy to iterate on spacing and density.
- react-markdown + remark-gfm + shiki — Renders LLM output with markdown, tables, and syntax-highlighted code blocks without writing a custom renderer.
- LocalStorage wrapper — Caches chat threads and flags (e.g. `newsMode`) for fast reloads; store hydrates from local data before hitting the backend.
- Framer Motion + Lucide + Sonner — Micro-interactions (typing indicator, transitions) and basic UX elements (icons, toasts) around the core chat flow.

### Trade-offs / limitations (frontend-focused)

- First message pays WebSocket connect cost because we connect lazily; better for idle users, slightly worse for very first turn latency.
- `messageProgress` schema is intentionally loose; progress UI depends on the backend sending consistent `stage/substage/title`, so backend changes can silently degrade UX.
- LocalStorage caching can diverge from server state (e.g. deletions from another device); we partially mitigate by refetching chat lists after writes, but not every edge case is reconciled.
- Temporary chat ids (`temp-*`) plus async upgrade work well in the happy path; on rare socket failures we can end up with local-only threads showing error messages until the user refreshes.

## End-to-End Flow (Frontend View)

1. User opens the frontend; React boots, `useChatStore` hydrates from localStorage, and the chat list is fetched via REST (`chatClient.getAll`).
2. Session is created during signup/login: auth endpoints set the HTTP-only cookie / token; the frontend only tracks “authenticated vs not” and basic user info.
3. When the chat page mounts with a `chatId`, the UI calls `messageClient.getMessages(chatId)` to load server history and merge it with any cached messages.
4. User types a query and hits send; `ChatWindow` calls `sendMessage(currentChatId, content)` on the Zustand store.
5. The store ensures a WebSocket connection by calling `webSocketClient.connect()` if needed; Socket.IO upgrades to WebSocket and binds the connection to the authenticated session.
6. If there’s no server chat yet, the store creates a temporary chat in memory (synthetic `temp-*` id), inserts the local user message, and marks it as “temporary.”
7. `webSocketClient.sendMessage` emits a `message:create` event with `chatId` (or `null` for new), content, mode (default/news), and a client-generated `messageId` used for correlation.
8. The backend receives the event, resolves/creates the chat session, attaches the message to the right thread, and loads any required history for context.
9. Backend generates embeddings for the new message (and relevant history) and runs vector search against the document store; results are staged for the LLM call.
10. Redis is used on the backend as a scratchpad for progress and orchestration (e.g. tracking pipeline stages and partial results) and as a fan-out layer for progress events.
11. Gemini is called with the user message, conversation window, and retrieved context; as the backend moves through stages (embedding, vector search, ranking, LLM generation, news aggregation), it emits `message:progress` events.
12. When Gemini completes, the backend pushes a `message:completed` event containing the canonical `userMessage`, `assistantMessage`, optional sources, and the final `chatId`/title for first-turn chats.
13. The frontend’s WebSocket handlers update `messageProgress`, clear temp messages, upgrade temp chats to real ids, write the new state to localStorage, and trigger a background `loadAllChats` to refresh the sidebar.
14. React re-renders `ChatWindow` with the new messages; `ChatProgressIndicator` uses the latest progress snapshot to animate status until typing stops, and the user sees the final answer plus any sources.
