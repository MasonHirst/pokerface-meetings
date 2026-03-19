# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Local Development

**Client (React dev server on port 3000):**
```bash
cd client && npm start
```

**Server (with nodemon on port 8080):**
```bash
cd server && npm run server
```

**Server on local network IP (for mobile testing):**
```bash
cd server && npm run server:wifi
```

### Building

The client builds directly into `server/build/`, so the server can serve it statically:
```bash
cd client && npm run build
```

### Testing

**Server integration tests (Jest + supertest):**
```bash
cd server && npm test
cd server && npm run test:watch
```

**Client unit tests (React Testing Library):**
```bash
cd client && npm test
```

**E2E tests (Playwright — requires server running on port 8080):**
```bash
npm test                        # from root
npx playwright test             # specific test file
npx playwright test tests/e2e/voting.spec.js
```

## Architecture

### Overview

Full-stack planning poker app. React SPA (client) + Express + WebSocket server (server). No database — all game state is held **in memory** on the server and is ephemeral.

### Communication Model

- **REST API** (`/game/create`, `/game/upload_image`, `/contact`): used for game room creation and supporting actions
- **WebSocket** (`ws` library): all real-time game state — voting, revealing, chat, emoji throws, player management

Every WebSocket message from client follows `{ body, gameId, token }`. Server broadcasts via `gameUpdated` events.

### Client State (GameContext)

`client/src/context/GameContext.jsx` is the central hub. It owns:
- WebSocket connection lifecycle (including reconnect with exponential backoff)
- Game data: players, game settings, vote history
- Player identity sourced from `localStorage` (`PokerfaceLocalUserToken`, `PokerfacePlayerName`, `PokerfaceCardImage`, `PokerfaceSavedDecks`)
- Player power level: `owner > high > low > none`

Components communicate with GameContext via the `mitt`-based event bus (`client/src/utils/eventBus.js`) to avoid prop drilling.

### Server State (socketController)

`server/controllers/socketController.js` owns two in-memory dictionaries:
- `gameRooms`: all active game rooms and their state
- `clientsList`: maps player tokens to WebSocket connections

Game room structure: `{ gameRoomId, players, gameSettings, voteHistory, lastAction }`.

### Client Routing

- `/` → Home (create or join game)
- `/game/create` → Game creation form
- `/game/:game_id` → Active game room

### axios Configuration

Set up in `client/src/index.js`:
- Dev: `baseURL = http://localhost:8080`
- Prod: `baseURL = window.location.origin`
- All requests automatically include the `Authorization` header from localStorage token.

### Build & Deploy

- GitHub Actions on push to `main`: builds client → builds Docker image → pushes to Docker Hub → deploys to Fly.io
- `REACT_APP_VERSION` and `REACT_APP_GIT_SHA` are injected at build time by CI
- Server Dockerfile and `fly.toml` live in `server/`

### Environment Variables

Server reads from `server/.env`:
- `PORT` — defaults to 8080
- `JWT_SIGNING_SECRET` — JWT signing
- `CLOUDINARY_*` — image hosting
- `SEND_IN_BLUE_API_KEY` / `EMAIL_TARGET` — contact form email
- `TENOR_API_KEY` — GIF picker
- `USE_LOCAL_IP=true` — bind to local network IP instead of localhost

### Testing Patterns

**Server tests** boot a real HTTP + WebSocket server, use `supertest` for REST calls and the `ws` client for socket simulation. Tests are scenario-based (multi-step game flows).

**Client tests** use `renderWithProviders()` (`client/src/test-utils/renderWithProviders.jsx`) which wraps components in `BrowserRouter` + `GameProvider` and replaces WebSocket with a `FakeWebSocket` class.

**E2E tests** (Playwright) simulate multiple browser contexts (host + players) against a real running server on `localhost:8080`.
