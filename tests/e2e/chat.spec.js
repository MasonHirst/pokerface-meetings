const { test, expect } = require('@playwright/test')
const { createPlayer, createGame, joinGame } = require('./helpers')

test('host sends a chat message and player receives it', async ({ browser }) => {
  const { context: hostCtx, page: host } = await createPlayer(browser, 'Host')
  const { context: playerCtx, page: player } = await createPlayer(browser, 'Player')

  const roomUrl = await createGame(host, 'Chat E2E')
  await joinGame(host, roomUrl)
  await joinGame(player, roomUrl)

  // Wait for both to be connected
  await host.getByText('Player', { exact: true }).waitFor({ timeout: 8000 })

  // Host opens the chat drawer via the ChatOutlinedIcon button
  await host.locator('button:has([data-testid="ChatOutlinedIcon"])').click()

  // Host types and sends a message
  await host.getByPlaceholder(/message/i).fill('Hello from host')
  await host.getByPlaceholder(/message/i).press('Enter')

  // Player opens chat drawer
  await player.locator('button:has([data-testid="ChatOutlinedIcon"])').click()

  // Player sees the message
  await expect(player.getByText('Hello from host')).toBeVisible({ timeout: 5000 })

  // Host also sees their own message in the drawer
  await expect(host.getByText('Hello from host')).toBeVisible()

  await hostCtx.close()
  await playerCtx.close()
})
