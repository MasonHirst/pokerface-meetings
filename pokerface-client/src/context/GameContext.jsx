import React, { createContext, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName'))
  const [appIsLoading, setAppIsLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const [gameData, setGameData] = useState({})
  const [gameExists, setGameExists] = useState(false)
  const { game_id } = useParams()

  console.success = function (message) {
    console.log('%c✅ ' + message, 'color: #04A57D; font-weight: bold;')
  }
  console.warning = function (message) {
    console.log('%c⚠️ ' + message, 'color: yellow; font-weight: bold;')
  }

  function sendMessage(type, body) {
    const bodyStr = JSON.stringify({ type, body, gameId: game_id, token: localStorage.getItem('localUserToken') })
    socket.send(bodyStr)
  }

  let connectCounter = 0

  // function getLatestGameInfo() {
  //   axios
  //     .get(`game/latest/${game_id}`)
  //     .then(({ data }) => {
  //       if (data.gameRoomName) {
  //         setGameData(data)
  //       }
  //     })
  //     .catch(console.error)
  // }

  useEffect(() => {
    if (!playerName) return
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
      const ws = new WebSocket(
        `${serverUrl}?token=${localStorage.getItem(
          'localUserToken'
        )}&player_name=${playerName}&game_id=${game_id}`
      )

      ws.addEventListener('open', function () {
        console.log('established socket connection')
        if (connectCounter > 0) console.success('Reconnected to socket server')
      })

      ws.addEventListener('error', function (error) {
        console.error('WebSocket Error ' + error)
      })

      ws.addEventListener('message', function (event) {
        if (!event?.data) return
        let messageData = JSON.parse(event.data)
        
        if (messageData.event_type === 'playerJoinedGame') {
          setGameData(messageData.game)
        } 
        
        else if (messageData.event_type === 'gameUpdated') {
          setGameData(messageData.game)
        } 
        
        else if (messageData.event_type === 'gameNotFound') {
          console.warning('Game not found at join attempt')
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
    }
    connectClient()
  }, [playerName])

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
        sendMessage,
        playerName,
        setPlayerName,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
