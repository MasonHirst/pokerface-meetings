const { test, expect } = require('@playwright/test')
const { createPlayer, createGame, joinGame } = require('./helpers')

test('host and player can join the same game and see each other', async ({ browser }) => {
  const { context: hostContext, page: hostPage } = await createPlayer(browser, 'Host E2E')
  const { context: playerContext, page: playerPage } = await createPlayer(browser, 'Player E2E')

  const roomUrl = await createGame(hostPage, 'E2E Room')
  await joinGame(hostPage, roomUrl)
  await joinGame(playerPage, roomUrl)

  await expect(hostPage.getByText('Player E2E', { exact: false })).toBeVisible({ timeout: 8000 })
  await expect(playerPage.getByText('Host E2E', { exact: false })).toBeVisible({ timeout: 8000 })

  await hostContext.close()
  await playerContext.close()
})

