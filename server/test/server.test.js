const { WebSocket } = require('ws')
const request = require('supertest')
const { startServer } = require('../index')
const { resetInMemoryState } = require('../controllers/socketController')

let httpServer
let baseUrl

const defaultDeck = { name: 'Fibonacci', values: ['1', '2', '3', '5', '8'] }

beforeAll(async () => {
  process.env.PORT = '0'
  resetInMemoryState()
  httpServer = await startServer()
  const address = httpServer.address()
  const port = typeof address === 'string' ? 80 : address.port
  baseUrl = `http://localhost:${port}`
})

beforeEach(() => {
  resetInMemoryState()
})

afterAll(async () => {
  if (httpServer && httpServer.close) {
    await new Promise((resolve) => httpServer.close(resolve))
  }
})

// ─── Helpers ────────────────────────────────────────────────────────────────

async function createGame(hostToken = 'host-' + Date.now()) {
  const res = await request(baseUrl)
    .post('/game/create')
    .set('Authorization', hostToken)
    .send({ gameName: 'Test Room', deck: defaultDeck, gameHost: hostToken })
    .expect(200)
  return {
    gameId: res.body.gameRoomId,
    hostToken,
    gameSettings: res.body.gameSettings,
  }
}

function connectWs(token, playerName, gameId, observerOnly = false) {
  const ws = new WebSocket(
    `${baseUrl.replace('http', 'ws')}?token=${encodeURIComponent(token)}&player_name=${encodeURIComponent(playerName)}&game_id=${encodeURIComponent(gameId)}&player_card_image=null&observer_only=${observerOnly}`
  )
  const events = []
  ws.on('message', (data) => events.push(JSON.parse(data.toString())))
  return { ws, events }
}

function send(ws, token, gameId, type, extras = {}, timestamp = Date.now()) {
  ws.send(
    JSON.stringify({
      body: { reqType: { type, timeStamp: timestamp }, ...extras },
      gameId,
      token,
    })
  )
}

async function closeAll(...wsList) {
  const promises = wsList.map((ws) => new Promise((resolve) => ws.on('close', resolve)))
  wsList.forEach((ws) => ws.close())
  await Promise.all(promises)
}

// Waits for a player's own playerJoinedGame event
async function waitForJoin(events) {
  await waitFor(() => {
    expect(events.some((e) => e.event_type === 'playerJoinedGame')).toBeTruthy()
  })
}

// Waits for the host to see N players in the room via gameUpdated
async function waitForPlayers(hostEvents, count) {
  await waitFor(() => {
    const latest = hostEvents.filter((e) => e.event_type === 'gameUpdated').at(-1)
    expect(Object.keys(latest?.data?.players || {}).length).toBe(count)
  })
}

function latestGameUpdated(events) {
  return events.filter((e) => e.event_type === 'gameUpdated').at(-1)
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Game lifecycle happy path', () => {
  test('creates a game and allows two players to join and vote', async () => {
    const gameHost = 'host-token-123'

    const createRes = await request(baseUrl)
      .post('/game/create')
      .set('Authorization', gameHost)
      .send({
        gameName: 'Test Room',
        deck: { name: 'Fibonacci', values: ['1', '2', '3'] },
        gameHost,
      })
      .expect(200)

    const createdRoom = createRes.body
    expect(createdRoom.gameRoomId).toBeDefined()
    const gameId = createdRoom.gameRoomId

    const hostWs = new WebSocket(
      `${baseUrl.replace('http', 'ws')}?token=${gameHost}&player_name=Host&game_id=${gameId}&player_card_image=null&observer_only=false`
    )

    const playerToken = 'player-token-456'
    const playerWs = new WebSocket(
      `${baseUrl.replace('http', 'ws')}?token=${playerToken}&player_name=Player&game_id=${gameId}&player_card_image=null&observer_only=false`
    )

    const hostEvents = []
    const playerEvents = []

    hostWs.on('message', (data) => {
      hostEvents.push(JSON.parse(data.toString()))
    })
    playerWs.on('message', (data) => {
      playerEvents.push(JSON.parse(data.toString()))
    })

    await waitFor(() => {
      expect(
        hostEvents.some((e) => e.event_type === 'playerJoinedGame')
      ).toBeTruthy()
      expect(
        playerEvents.some((e) => e.event_type === 'playerJoinedGame')
      ).toBeTruthy()
    })

    const now = Date.now()
    hostWs.send(
      JSON.stringify({
        body: {
          reqType: { type: 'updatedCardChoice', timeStamp: now },
          card: { value: '2' },
        },
        gameId,
        token: gameHost,
      })
    )
    playerWs.send(
      JSON.stringify({
        body: {
          reqType: { type: 'updatedCardChoice', timeStamp: now + 1 },
          card: { value: '3' },
        },
        gameId,
        token: playerToken,
      })
    )

    await waitFor(() => {
      expect(
        hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')
      ).toBeTruthy()
      expect(
        playerEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')
      ).toBeTruthy()
    })

    hostWs.send(
      JSON.stringify({
        body: {
          reqType: { type: 'updateGameState', timeStamp: Date.now() + 2 },
          gameState: 'reveal',
        },
        gameId,
        token: gameHost,
      })
    )

    await waitFor(() => {
      const gameUpdatedEvents = hostEvents.filter(
        (e) => e.event_type === 'gameUpdated'
      )
      const latest = gameUpdatedEvents[gameUpdatedEvents.length - 1]
      expect(latest).toBeDefined()
      expect(latest.data.voteHistory?.length).toBeGreaterThanOrEqual(1)
    })

    const hostClosed = new Promise((resolve) => hostWs.on('close', resolve))
    const playerClosed = new Promise((resolve) => playerWs.on('close', resolve))
    hostWs.close()
    playerWs.close()
    await Promise.all([hostClosed, playerClosed])
  }, 30000)
})

// ─── Authentication ──────────────────────────────────────────────────────────

describe('Authentication', () => {
  test('returns 401 when Authorization header is missing', async () => {
    await request(baseUrl)
      .post('/game/create')
      .send({ gameName: 'Room', deck: defaultDeck, gameHost: 'token' })
      .expect(401)
  })
})

// ─── WebSocket connection ────────────────────────────────────────────────────

describe('WebSocket connection', () => {
  test('receives gameNotFound when joining a non-existent game', async () => {
    const { ws, events } = connectWs('ghost-token', 'Ghost', 'fake-game-id')
    await waitFor(() => {
      expect(events.some((e) => e.event_type === 'gameNotFound')).toBeTruthy()
    })
    await closeAll(ws)
  })

  test('duplicate player names get a numbered suffix', async () => {
    const { gameId, hostToken } = await createGame()
    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Alice', gameId)
    await waitForJoin(hostEvents)

    const playerToken = 'dup-' + Date.now()
    const { ws: playerWs, events: playerEvents } = connectWs(playerToken, 'Alice', gameId)
    await waitForJoin(playerEvents)

    await waitFor(() => {
      const latest = latestGameUpdated(hostEvents)
      const names = Object.values(latest?.data?.players || {}).map((p) => p.playerName)
      expect(names).toContain('Alice(1)')
    })

    await closeAll(hostWs, playerWs)
  })
})

// ─── Card voting ─────────────────────────────────────────────────────────────

describe('Card voting', () => {
  test('stale timestamp vote is silently dropped', async () => {
    const { gameId, hostToken } = await createGame()
    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)

    const now = Date.now()
    // First vote at T
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '5' }, now)
    await waitFor(() => {
      expect(
        hostEvents.some(
          (e) => e.event_type === 'cardChoicePrivateResponse' && e.data.card === '5'
        )
      ).toBeTruthy()
    })

    // Stale vote at T-1000 with a different card — should be dropped
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '1' }, now - 1000)
    await new Promise((r) => setTimeout(r, 100))

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })

    await waitFor(() => {
      const latest = latestGameUpdated(hostEvents)
      const vote = latest?.data?.voteHistory?.[0]?.votes?.[0]
      expect(vote).toBeDefined()
      expect(vote.card).toBe('5') // stale '1' was not recorded
    })

    await closeAll(hostWs)
  })

  test('player not in room receives notInGameRoom event', async () => {
    const { gameId, hostToken } = await createGame()
    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)

    // Explicitly leave the game room
    send(hostWs, hostToken, gameId, 'playerLeaveGame')
    await new Promise((r) => setTimeout(r, 100))

    // Attempt to vote after leaving
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '3' })
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'notInGameRoom')).toBeTruthy()
    })

    await closeAll(hostWs)
  })
})

// ─── Reveal phase calculations ───────────────────────────────────────────────

describe('Reveal phase calculations', () => {
  test('calculates average, participation, and agreement for split votes', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    const now = Date.now()
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '2' }, now)
    send(playerWs, playerToken, gameId, 'updatedCardChoice', { card: '4' }, now + 1)
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })

    await waitFor(() => {
      const record = latestGameUpdated(hostEvents)?.data?.voteHistory?.[0]
      expect(record).toBeDefined()
      expect(record.average).toBe(3.0)
      expect(record.participation).toBe('2/2')
      expect(record.agreement).toBe(0) // all different votes → no consensus
    })

    await closeAll(hostWs, playerWs)
  })

  test('unanimous votes result in agreement of 1', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    const now = Date.now()
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '3' }, now)
    send(playerWs, playerToken, gameId, 'updatedCardChoice', { card: '3' }, now + 1)
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })

    await waitFor(() => {
      const record = latestGameUpdated(hostEvents)?.data?.voteHistory?.[0]
      expect(record?.agreement).toBe(1)
    })

    await closeAll(hostWs, playerWs)
  })

  test('participation reflects partial voting', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    // Only host votes; player abstains
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '5' })
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })

    await waitFor(() => {
      const record = latestGameUpdated(hostEvents)?.data?.voteHistory?.[0]
      expect(record?.participation).toBe('1/2')
    })

    await closeAll(hostWs, playerWs)
  })

  test('observers are excluded from vote calculations', async () => {
    const { gameId, hostToken } = await createGame()
    const observerToken = 'observer-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: observerWs } = connectWs(observerToken, 'Observer', gameId, true)
    await waitForPlayers(hostEvents, 2)

    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '5' })
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })

    await waitFor(() => {
      const record = latestGameUpdated(hostEvents)?.data?.voteHistory?.[0]
      expect(record).toBeDefined()
      expect(record.participation).toBe('1/1') // observer not counted
      expect(record.votes.length).toBe(1) // only host's vote
    })

    await closeAll(hostWs, observerWs)
  })

  test('anonymous mode omits player names from vote records', async () => {
    const { gameId, hostToken, gameSettings } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    // Enable anonymous mode
    send(hostWs, hostToken, gameId, 'updatedGameSettings', {
      gameSettingsToSave: { ...gameSettings, anonymousMode: true },
    })
    await waitFor(() => {
      expect(latestGameUpdated(hostEvents)?.data?.gameSettings?.anonymousMode).toBe(true)
    })

    const now = Date.now()
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '3' }, now)
    send(playerWs, playerToken, gameId, 'updatedCardChoice', { card: '5' }, now + 1)
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })

    await waitFor(() => {
      const votes = latestGameUpdated(hostEvents)?.data?.voteHistory?.[0]?.votes
      expect(votes?.length).toBeGreaterThan(0)
      votes.forEach((vote) => {
        expect(vote.playerName).toBeUndefined()
      })
    })

    await closeAll(hostWs, playerWs)
  })
})

// ─── Game state transitions ──────────────────────────────────────────────────

describe('Game state transitions', () => {
  test('resetting to voting clears all player votes and currentIssueName', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    // Set an issue name
    send(hostWs, hostToken, gameId, 'setIssueName', { issueName: 'TICKET-123' })

    // Both players vote
    const now = Date.now()
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '3' }, now)
    send(playerWs, playerToken, gameId, 'updatedCardChoice', { card: '5' }, now + 1)
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    // Reveal, then reset
    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'reveal' })
    await waitFor(() => {
      expect(latestGameUpdated(hostEvents)?.data?.gameSettings?.gameState).toBe('reveal')
    })

    send(hostWs, hostToken, gameId, 'updateGameState', { gameState: 'voting' })

    await waitFor(() => {
      const latest = latestGameUpdated(hostEvents)
      const players = latest?.data?.players
      expect(players).toBeDefined()
      Object.values(players).forEach((p) => expect(p.hasVoted).toBe(false))
      expect(latest?.data?.gameSettings?.currentIssueName).toBeNull()
    })

    await closeAll(hostWs, playerWs)
  })
})

// ─── Player management ───────────────────────────────────────────────────────

describe('Player management', () => {
  test('kicked player receives kickedFromGame event', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-kick-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs, events: playerEvents } = connectWs(playerToken, 'Player', gameId)
    await waitForJoin(playerEvents)

    send(hostWs, hostToken, gameId, 'kickPlayer', { playerTokens: [playerToken] })

    await waitFor(() => {
      expect(playerEvents.some((e) => e.event_type === 'kickedFromGame')).toBeTruthy()
    })

    await closeAll(hostWs, playerWs)
  })

  test('disconnecting player is removed from the room', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-disc-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs, events: playerEvents } = connectWs(playerToken, 'Player', gameId)
    await waitForJoin(playerEvents)

    const playerClosed = new Promise((resolve) => playerWs.on('close', resolve))
    playerWs.close()
    await playerClosed

    await waitFor(() => {
      const players = latestGameUpdated(hostEvents)?.data?.players
      expect(players).toBeDefined()
      expect(Object.keys(players)).not.toContain(playerToken)
    })

    await closeAll(hostWs)
  })
})

// ─── Game settings ───────────────────────────────────────────────────────────

describe('Game settings', () => {
  test('changing the deck resets all player votes', async () => {
    const { gameId, hostToken, gameSettings } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    // Both vote
    const now = Date.now()
    send(hostWs, hostToken, gameId, 'updatedCardChoice', { card: '3' }, now)
    send(playerWs, playerToken, gameId, 'updatedCardChoice', { card: '5' }, now + 1)
    await waitFor(() => {
      expect(hostEvents.some((e) => e.event_type === 'cardChoicePrivateResponse')).toBeTruthy()
    })

    // Change the deck
    const newSettings = {
      ...gameSettings,
      deck: { name: 'T-shirt', values: ['XS', 'S', 'M', 'L', 'XL'] },
    }
    send(hostWs, hostToken, gameId, 'updatedGameSettings', { gameSettingsToSave: newSettings })

    await waitFor(() => {
      const players = latestGameUpdated(hostEvents)?.data?.players
      expect(players).toBeDefined()
      Object.values(players).forEach((p) => expect(p.hasVoted).toBe(false))
    })

    await closeAll(hostWs, playerWs)
  })
})

// ─── Chat ────────────────────────────────────────────────────────────────────

describe('Chat', () => {
  test('chat messages are capped at 50', async () => {
    const { gameId, hostToken } = await createGame()
    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)

    for (let i = 0; i < 51; i++) {
      send(hostWs, hostToken, gameId, 'newChatMessage', {
        message: `Message ${i}`,
        type: 'text',
        senderName: 'Host',
        sendTime: Date.now() + i,
      })
    }

    await waitFor(() => {
      expect(latestGameUpdated(hostEvents)?.data?.chatMessages?.length).toBe(50)
    })

    await closeAll(hostWs)
  })
})

// ─── Fun mode ────────────────────────────────────────────────────────────────

describe('Fun mode', () => {
  test('emoji throw is ignored when fun mode is disabled', async () => {
    const { gameId, hostToken } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs, events: playerEvents } = connectWs(playerToken, 'Player', gameId)
    await waitForJoin(playerEvents)

    // funModeEnabled is false by default
    send(hostWs, hostToken, gameId, 'funEmojiThrow', {
      emoji: '🎉',
      targetPlayerId: playerToken,
      fromSide: 'left',
    })

    await new Promise((r) => setTimeout(r, 150))
    expect(playerEvents.some((e) => e.event_type === 'funEmojiThrow')).toBe(false)

    await closeAll(hostWs, playerWs)
  })

  test('emoji throw broadcasts when fun mode is enabled', async () => {
    const { gameId, hostToken, gameSettings } = await createGame()
    const playerToken = 'player-' + Date.now()

    const { ws: hostWs, events: hostEvents } = connectWs(hostToken, 'Host', gameId)
    await waitForJoin(hostEvents)
    const { ws: playerWs, events: playerEvents } = connectWs(playerToken, 'Player', gameId)
    await waitForPlayers(hostEvents, 2)

    // Enable fun mode
    send(hostWs, hostToken, gameId, 'updatedGameSettings', {
      gameSettingsToSave: { ...gameSettings, funModeEnabled: true },
    })
    await waitFor(() => {
      expect(latestGameUpdated(hostEvents)?.data?.gameSettings?.funModeEnabled).toBe(true)
    })

    send(hostWs, hostToken, gameId, 'funEmojiThrow', {
      emoji: '🎉',
      targetPlayerId: playerToken,
      fromSide: 'left',
    })

    await waitFor(() => {
      expect(playerEvents.some((e) => e.event_type === 'funEmojiThrow')).toBeTruthy()
    })

    await closeAll(hostWs, playerWs)
  })
})

// ─── Utility ─────────────────────────────────────────────────────────────────

function waitFor(assertion, timeout = 5000, interval = 50) {
  const start = Date.now()

  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        assertion()
        resolve()
      } catch (err) {
        if (Date.now() - start > timeout) {
          reject(err)
        } else {
          setTimeout(check, interval)
        }
      }
    }
    check()
  })
}
