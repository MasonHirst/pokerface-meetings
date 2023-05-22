import React, { createContext, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import spidermanCrying from '../assets/spiderman-crying.gif'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'

export const GameContext = createContext()

export const GameProvider = ({ children }) => {
  if (localStorage.getItem('playerName') && localStorage.getItem('playerName').length > 9) localStorage.removeItem('playerName')
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('playerName')
  )
  const [appIsLoading, setAppIsLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const navigate = useNavigate()
  let activeSocket = true
  function toggleActiveSocket(state) {
    activeSocket = state
  }
  const [gameData, setGameData] = useState({})
  const [gameExists, setGameExists] = useState(false)
  const [joinGameLoading, setJoinGameLoading] = useState(false)
  const { game_id } = useParams()

  console.success = function (message) {
    console.log('%c✅ ' + message, 'color: #04A57D; font-weight: bold;')
  }
  console.warning = function (message) {
    console.log('%c⚠️ ' + message, 'color: yellow; font-weight: bold;')
  }

  // eslint-disable-next-line
  function sendMessage(type, body) {
    const bodyStr = JSON.stringify({
      type,
      body,
      gameId: game_id,
      token: localStorage.getItem('localUserToken'),
    })
    socket?.send(bodyStr)
  }

  function confirmFailJoin(socket) {
    Swal.fire({
      title: 'Could not join game room',
      text: 'This game room does not exist or is full.',
      imageUrl: spidermanCrying,
      imageWidth: 'min(90vw, 400px',
      confirmButtonText: 'Take me home',
      customClass: {
        popup: 'swal2-popup', // Add the custom CSS class to the 'popup' element
      },
    }).then((result) => {
      if (result.isConfirmed) {
        toggleActiveSocket(false)
        socket.close()
        navigate('/')
      }
    })
  }

  let connectCounter = 0
  let notFoundConnectCounter = 0

  useEffect(() => {
    if (!playerName || !game_id || !activeSocket) return
    function connectClient() {
      if (!game_id) return console.log('not in game room, aborting connection')
      setJoinGameLoading(true)
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
        )}&player_name=${playerName}&game_id=${game_id}&player_card_image=${localStorage.getItem('pokerCardImage')}`
      )

      ws.addEventListener('open', function () {
        console.success('established socket connection')
        if (connectCounter > 0) console.success('Reconnected to socket server')
      })

      ws.addEventListener('error', function (error) {
        console.error('WebSocket Error: ', error)
      })

      ws.addEventListener('message', function (event) {
        if (!event?.data) return
        let messageData = JSON.parse(event.data)

        if (messageData.event_type === 'playerJoinedGame') {
          setJoinGameLoading(false)
          setGameData(messageData.game)
        } else if (messageData.event_type === 'gameUpdated') {
          setGameData(messageData.game)
        } else if (messageData.event_type === 'gameNotFound') {
          console.warning('Game not found at join attempt')
          notFoundConnectCounter++
          if (notFoundConnectCounter < 10) {
            setTimeout(() => {
              console.warning('Trying to rejoin game room...')
              ws.close() // close the socket connection, which will trigger a reconnect
            }, 500)
          } else {
            confirmFailJoin(ws)
          }
        }
      })

      ws.addEventListener('close', function () {
        console.warning('Disconnected from socket server')
        connectCounter++
        setTimeout(() => {
          console.warning('Reconnecting...')
          if (!activeSocket || !game_id) {
            return
          } else {
            console.log('active socket:', activeSocket)
            console.log('connecting again! yay!')
            connectClient() // try to reconnect after a delay
          }
        }, 1000) // wait for 1 second before reconnecting
      })

      setSocket(ws)
    }
    connectClient()
  }, [playerName, game_id])

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
        joinGameLoading,
        setPlayerName,
        toggleActiveSocket,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
