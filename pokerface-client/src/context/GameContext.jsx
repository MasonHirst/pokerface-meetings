import React, { createContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export const GameContext = createContext()

const send = (socket, event, body) => {
  socket?.send(JSON.stringify({ event, body }))
}

export const GameProvider = ({ children }) => {

  const [appIsLoading, setAppIsLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const [gameData, setGameData] = useState({})
  const [gameExists, setGameExists] = useState(false)
  const { game_id } = useParams()
  const [localUserToken, setLocalUserToken] = useState(
    localStorage.getItem('localUserToken')
  )

  console.success = function (message) {
    console.log('%c✅ ' + message, 'color: #04A57D; font-weight: bold;')
  }
  console.warning = function (message) {
    console.log('%c⚠️ ' + message, 'color: yellow; font-weight: bold;')
  }

  let connectCounter = 0

  function getLatestGameInfo() {
    axios
      .get(`game/latest/${game_id}`)
      .then(({ data }) => {
        if (data.gameRoomName) {
          setGameData(data)
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    if (!gameExists) return
    let websocket
    function connectClient() {
      let serverUrl
      let scheme = 'ws'
      let location = document.location
      if (location.protocol === 'https:') {
        scheme += 's'
      }
      serverUrl = `${scheme}://${location.hostname}:${location.port}`
      if (process.env.NODE_ENV === 'development') {
        serverUrl = 'ws://localhost:8080'
      }
      const ws = new WebSocket(serverUrl)

      ws.addEventListener('open', function () {
        console.log('established socket connection')
        if (connectCounter > 0) console.success('Reconnected to socket server')
        send(ws, 'newLocalPlayer', {
          localUserToken,
          gameId: game_id,
          playerName: localStorage.getItem('playerName')
        })
      })
      
      ws.addEventListener('error', function (error) {
        console.error('WebSocket Error ' + error)
      })
      
      ws.addEventListener('message', function (event) {
        if (!event?.data) return
        let messageData = JSON.parse(event.data)
        if (messageData.event_type === 'playerJoinedGame') {
          getLatestGameInfo()
        } else if (messageData.event_type === 'gameUpdated') {
          getLatestGameInfo()
        }
      })

      ws.addEventListener('close', function () {
        console.warning('Disconnected from socket server')
        connectCounter++
        setTimeout(() => {
          console.warning('Reconnecting...')
          connectClient() // try to reconnect after a delay
        }, 1000) // wait for 1 second before reconnecting
      })

      setSocket(ws)
      websocket = ws
    }
    connectClient()

    // return () => {
    //     websocket.close()
    // }
  }, [localUserToken, gameExists])

  return (
    <GameContext.Provider
      value={{
        children,
        appIsLoading,
        setAppIsLoading,
        setGameExists,
        gameExists,
        gameData,
        setGameData,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
