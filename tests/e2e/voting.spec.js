const { test, expect } = require('@playwright/test')
const { createPlayer, createGame, joinGame } = require('./helpers')

test('full voting round: both players vote, host reveals, results shown, new round resets', async ({ browser }) => {
  const { context: hostCtx, page: host } = await createPlayer(browser, 'Host')
  const { context: playerCtx, page: player } = await createPlayer(browser, 'Player')

  // Host creates game and waits for game room
  const roomUrl = await createGame(host, 'Voting E2E')
  await joinGame(host, roomUrl)

  // Player joins the same room
  await joinGame(player, roomUrl)

  // Host waits until Player's card appears on the table (confirms WS sync)
  await host.getByText('Player', { exact: true }).waitFor({ timeout: 8000 })

  // Both players pick a card from the footer
  await host.locator('.game-footer').getByText('3', { exact: true }).first().click()
  await player.locator('.game-footer').getByText('5', { exact: true }).first().click()

  // "Reveal Cards" button should appear (at least one vote cast)
  await expect(host.getByRole('button', { name: 'Reveal Cards' })).toBeVisible({ timeout: 5000 })

  // Host reveals
  await host.getByRole('button', { name: 'Reveal Cards' }).click()

  // VoteSummary shows vote counts on both screens
  await expect(host.getByText('1 vote').first()).toBeVisible({ timeout: 5000 })
  await expect(player.getByText('1 vote').first()).toBeVisible({ timeout: 5000 })

  // "New round" button is now shown in the PlayingTable
  await expect(host.getByRole('button', { name: 'New round' })).toBeVisible()

  // Host starts a new round
  await host.getByRole('button', { name: 'New round' }).click()

  // Footer cards are visible again on both screens (voting state restored)
  await expect(host.getByText('Pick your cards!')).toBeVisible({ timeout: 5000 })
  await expect(player.getByText('Pick your cards!')).toBeVisible({ timeout: 5000 })

  await hostCtx.close()
  await playerCtx.close()
})
