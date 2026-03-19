## Testing Strategy for Pokerface Meetings

This document summarizes the testing approach for the Pokerface Meetings app and ties it directly to concrete test code that now exists in the repo.

### Overview

- **Server**: Node + Express + `ws`, with in-memory game state stored in `gameRooms` and `clientsList`.
- **Client**: React (CRA), using a `WebSocket` client in `GameContext` and heavy use of `localStorage` / `sessionStorage`.
- **Goal**: Exercise realistic multi-user flows (like a full planning poker session) with:
  - Long-lived server integration tests that keep a game room alive across many steps.
  - Focused React Jest tests around `GameContext` and `GameRoom`.
  - High-value Playwright E2E tests simulating multiple browsers.

---

### 1. Server Integration Tests (Jest + ws)

**Key files**

- `server/index.js`
  - Now exports:
    - `createApp()` – builds and configures the Express app.
    - `startServer()` – creates the app, chooses host/port, and delegates to `startSocketServer`.
- `server/controllers/socketController.js`
  - Still owns:
    - `startSocketServer`
    - In-memory `gameRooms` and `clientsList`.
  - Now also exports:
    - `resetInMemoryState()` – resets `gameRooms` and `clientsList` for tests.
- `server/test/server.test.js`
  - Jest integration test that boots a real HTTP + WebSocket server, creates a game, and drives a happy-path multi-player voting flow.

**How the harness works**

- `startServer()` in `server/index.js`:
  - Creates the Express app via `createApp()`.
  - Resolves host / `USE_LOCAL_IP`.
  - Calls `startSocketServer(app, PORT, host?)`.
  - Returns the underlying HTTP server so tests can:
    - Discover the bound port (when `PORT=0` for an ephemeral port).
    - Shut the server down cleanly via `httpServer.close()`.
- `resetInMemoryState()` in `socketController.js`:
  - Sets `gameRooms = {}` and `clientsList = {}`.
  - Allows tests to start from a clean slate without relying on Node process restarts.

**Example scenario test**

The test in `server/test/server.test.js` demonstrates the intended pattern:

- **Setup**
  - `beforeAll`:
    - Forces `PORT=0` so Node picks a free port.
    - Calls `resetInMemoryState()` for a clean run.
    - Calls `startServer()` and derives `baseUrl` from `httpServer.address()`.
  - `afterAll`:
    - Closes the HTTP server.
- **Flow**
  - Creates a game via `POST /game/create` (using `supertest`).
  - Extracts the `gameRoomId` from the response.
  - Opens two `ws` connections:
    - Host (`host-token-123`) joining the room.
    - Player (`player-token-456`) joining the same room.
  - Collects server events in arrays (`hostEvents`, `playerEvents`).
  - Uses a small `waitFor` helper to:
    - Wait until each client has seen `playerJoinedGame`.
    - Send `updatedCardChoice` messages from both clients.
    - Wait until each client receives `cardChoicePrivateResponse`.
    - Send an `updateGameState` message to `'reveal'` from the host.
    - Wait until a `gameUpdated` event contains a non-empty `voteHistory`.

This is a **long-lived scenario-style test** that:

- Keeps one room alive across multiple steps (join → vote → reveal).
- Asserts on both protocol (`event_type` messages) and state (`voteHistory` content).

Additional scenarios (to be added over time) should follow the same shape but focus on:

- Observer mode (joining as / toggling to observer).
- Kicking a player.
- Chat history behavior and limits.
- Fun emoji behavior (when `funModeEnabled` is true).

---

### 2. Client Tests (Jest + React Testing Library)

**Key files**

- `client/src/context/GameContext.jsx`
  - Manages the `WebSocket` client, local identity, and the main game state.
- `client/src/components/game/GameRoom.jsx`
  - Page that wires UI to `GameContext`, including the initial name entry dialog.
- `client/src/test-utils/renderWithProviders.jsx`
  - Test helper that wraps components in `BrowserRouter` and `GameProvider`.
- `client/src/context/GameContext.test.jsx`
  - Tests the shape of outgoing socket messages from `sendMessage`.
- `client/src/components/game/GameRoom.test.jsx`
  - Tests the name-entry flow and `localStorage` integration for `PokerfacePlayerName`.

**renderWithProviders helper**

`renderWithProviders` gives tests a realistic environment:

- Wraps the UI under test in:
  - `BrowserRouter`
  - `GameProvider`
- Sets `window.history` to the provided `route` (e.g., `/game/room-1`) so `useParams` in `GameContext` sees a real game ID.

**Mocking WebSocket and storage**

Client tests use a very lightweight `FakeWebSocket`:

- A class with a `send` method implemented via `jest.fn()`.
- Installed as `global.WebSocket` in the test.
- Avoids any real network connections; only the payloads are asserted.

Storage is controlled per test:

- `localStorage.setItem('PokerfaceLocalUserToken', 'test-token')`
- `localStorage.setItem('PokerfacePlayerName', 'Tester')`
- `sessionStorage.setItem('kickedGames', JSON.stringify([]))`

**GameContext tests**

`GameContext.test.jsx` verifies that `sendMessage` builds the correct protocol payload:

- Renders a child component that calls `sendMessage('updatedCardChoice', { card: { value: '5' } })`.
- Asserts the first `WebSocket` instance’s `send` method received:
  - `gameId` from the route (`/game/room-1` → `room-1`).
  - `token` from `PokerfaceLocalUserToken`.
  - `body.card` matching the passed card.
  - `body.reqType` with:
    - `type: 'updatedCardChoice'`
    - Numeric `timeStamp`.

This is the main contract between the React client and the Node server.

**GameRoom tests**

`GameRoom.test.jsx` validates the local name-entry UX:

- With no `PokerfacePlayerName` in `localStorage`:
  - Renders `GameRoom` via `renderWithProviders`.
  - Fills the “Player Name” field with `Alice`.
  - Clicks “Join Game”.
  - Asserts `localStorage.getItem('PokerfacePlayerName') === 'Alice'`.

This exercises the same code path real users hit when first joining a room.

---

### 3. Playwright E2E Tests (Multi-User Browser Flows)

**Key files**

- `playwright.config.js`
  - Defines:
    - `testDir: ./tests/e2e`
    - A Chromium project using Playwright’s built-in `Desktop Chrome` device.
    - `use.baseURL` (defaults to `http://localhost:3000`).
    - A `webServer` that runs `cd client && npm start` and waits for `http://localhost:3000`.
- `tests/e2e/multiUserGame.spec.js`
  - First E2E test that drives a simple multi-user join flow.

**E2E flow implemented**

The `multiUserGame.spec.js` test simulates two separate browsers:

- `hostContext` / `hostPage` (the game host).
- `playerContext` / `playerPage` (another participant).

Steps:

1. **Host creates a game**
   - Visits `/game/create`.
   - Fills the “Game Name” field with `E2E Room`.
   - Clicks the “Create Game” button.
   - Waits for redirect to `/game/:game_id`.
   - Captures `roomUrl = hostPage.url()`.

2. **Player joins via the same URL**
   - Opens a fresh browser context (`playerContext`).
   - Navigates to `roomUrl`.
   - Fills the “Player Name” field with `Player E2E`.
   - Clicks “Join Game”.

3. **Host sees the joining player**
   - Waits for text containing `Player E2E` to appear on the host’s page.
   - Asserts that the host can see `Player E2E` in the UI.

This test verifies end-to-end plumbing:

- Frontend routing and forms.
- REST `POST /game/create` call from the client.
- WebSocket connection from both host and player.
- Server broadcasting updated game state so the host sees the new player.

Over time, more E2E tests can be added in the same folder to cover:

- Voting and reveal flows across host and player contexts.
- Observer mode behavior.
- Kicked player behavior and redirects.
- Fun emoji interactions.

---

### 4. How to Run the Tests

From the `server` directory:

- **Server integration tests (Jest)**
  - `npm test`
    - Runs `jest`, executing the long-lived game lifecycle test in `server/test/server.test.js`.

From the `client` directory:

- **Client Jest tests**
  - `npm test`
    - Runs CRA’s `react-scripts test`, picking up:
      - `GameContext.test.jsx`
      - `GameRoom.test.jsx`
      - Any future `*.test.jsx` / `*.test.js` files.

From the repo root:

- **Playwright E2E tests**
  - Install Playwright (once):
    - `npm install --save-dev @playwright/test`
    - `npx playwright install`
  - Run tests:
    - `npx playwright test`

Note: CI wiring (e.g., combined `test:ci` scripts) is left flexible so it can be adapted to your deployment pipeline.

