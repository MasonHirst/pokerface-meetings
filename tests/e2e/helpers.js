/**
 * Creates a browser context and page with localStorage pre-seeded to:
 * - suppress the "new updates" SweetAlert2 popup
 * - pre-set a player name so the join dialog is skipped automatically
 */
async function createPlayer(browser, playerName) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.addInitScript((name) => {
    localStorage.setItem('PokerfaceShownLatestUpdatesMessage', 'true')
    localStorage.setItem('PokerfacePlayerName', name)
  }, playerName)
  return { context, page }
}

/**
 * Creates a browser context and page for an observer (does not vote).
 * Sets sessionStorage PokerfaceObserverOnly so the WS URL includes observer_only=true.
 */
async function createObserver(browser, playerName) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.addInitScript((name) => {
    localStorage.setItem('PokerfaceShownLatestUpdatesMessage', 'true')
    localStorage.setItem('PokerfacePlayerName', name)
    sessionStorage.setItem('PokerfaceObserverOnly', 'true')
  }, playerName)
  return { context, page }
}

/**
 * Navigates to /game/create, fills the game name, submits, and returns
 * the room URL after the redirect to /game/:id.
 */
async function createGame(page, gameName = 'E2E Test') {
  await page.goto('/game/create')
  await page.getByLabel(/game name/i).fill(gameName)
  await page.getByRole('button', { name: /create game room/i }).click()
  await page.waitForURL(/\/game\/.+/)
  return page.url()
}

/**
 * Navigates to roomUrl and waits for the game room to be fully loaded.
 * Assumes playerName is already set in localStorage via createPlayer/createObserver.
 */
async function joinGame(page, roomUrl) {
  await page.goto(roomUrl)
  // PlayingTable renders "Pick your cards!" only after the playerJoinedGame
  // WebSocket event is received and gameData is set — reliable load indicator.
  await page.getByText('Pick your cards!').waitFor({ timeout: 10000 })
}

module.exports = { createPlayer, createObserver, createGame, joinGame }
