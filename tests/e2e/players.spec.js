const { test, expect } = require('@playwright/test')
const { createPlayer, createObserver, createGame, joinGame } = require('./helpers')

test('observer sees observer message instead of voting cards', async ({ browser }) => {
  const { context: hostCtx, page: host } = await createPlayer(browser, 'Host')
  const { context: obsCtx, page: observer } = await createObserver(browser, 'Watcher')

  const roomUrl = await createGame(host, 'Observer E2E')
  await joinGame(host, roomUrl)

  // Observer navigates to the room — sessionStorage PokerfaceObserverOnly is already set
  await observer.goto(roomUrl)
  await observer.getByText('Pick your cards!').waitFor({ timeout: 10000 })

  // Observer footer shows the observer message, not the card row
  await expect(
    observer.getByText('Cards are hidden because you are in observer mode.')
  ).toBeVisible()

  // Host sees the observer listed in the header
  await expect(host.getByText('Watcher')).toBeVisible({ timeout: 5000 })

  await hostCtx.close()
  await obsCtx.close()
})

test('host can kick a player from the game', async ({ browser }) => {
  const { context: hostCtx, page: host } = await createPlayer(browser, 'Host')
  const { context: playerCtx, page: player } = await createPlayer(browser, 'Kickme')

  const roomUrl = await createGame(host, 'Kick E2E')
  await joinGame(host, roomUrl)
  await joinGame(player, roomUrl)

  // Host waits until Kickme's card appears (confirms both are connected)
  await host.getByText('Kickme').waitFor({ timeout: 8000 })

  // Host opens the settings menu via the room name button in the header
  await host.locator('.game-header').getByRole('button', { name: 'Kick E2E' }).click()
  await host.getByRole('menuitem', { name: /game settings/i }).click()

  // Expand the "Kick players" section
  await host.getByText('Kick players').click()

  // Click the enabled Kick button (host's own Kick button is disabled)
  await host.locator('button:not([disabled])').filter({ hasText: /^Kick$/ }).click()

  // Save settings
  await host.getByRole('button', { name: /^save$/i }).click()

  // Kicked player's page shows the kicked error banner
  await expect(
    player.getByText('You have been kicked from this game', { exact: false })
  ).toBeVisible({ timeout: 8000 })

  await hostCtx.close()
  await playerCtx.close()
})
