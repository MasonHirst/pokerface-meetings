import React, { createContext, useState, useEffect } from 'react'

export const GameContext = createContext()

const send = (socket, event, body) => {
  socket?.send(JSON.stringify({ event, body }))
}

export const GameProvider = ({ children }) => {
  const [voteEvent, setVoteEvent] = useState({})
  const [participantEvent, setParticipantEvent] = useState({})
  const [appIsLoading, setAppIsLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [playersData, setPlayersData] = useState([])
  const [gameState, setGameState] = useState('')
  const [gameDeck, setGameDeck] = useState([])
  const [pastVotings, setPastVotings] = useState([])
  const [thisUserObj, setThisUserObj] = useState({})

  console.success = function (message) {
    console.log('%c✅ ' + message, 'color: #04A57D; font-weight: bold;')
  }
  console.warning = function (message) {
    console.log('%c⚠️ ' + message, 'color: yellow; font-weight: bold;')
  }

  let connectCounter = 0
  const localUserToken = localStorage.getItem('localUserToken')

  useEffect(() => {
    let websocket
    console.log('socket use effect started')
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
      // const ws = new WebSocket('wss://pokerface-meet.fly.dev:8080')
      // const ws = new WebSocket('ws://pokerface-meet.fly.dev')

      ws.addEventListener('open', function () {
        console.log('established socket connection')
        if (connectCounter > 0) console.success('Reconnected to socket server')
        send(ws, 'newLocalPlayer', {
          localUserToken,
        })
      })

      ws.addEventListener('error', function (error) {
        console.error('WebSocket Error ' + error)
      })

      ws.addEventListener('message', function (event) {
        if (!event?.data) return
        let messageData = JSON.parse(event.data)
        const body = messageData.message
        // console.log('messageData: ', messageData)
        if (messageData.event_type === 'gameUpdated') {
          // console.log('gameUpdated: ', messageData)
          setRoomName(body.gameRoomName)
          setGameState(body.gameState)
          setPlayersData(Object.values(body.players))
          setThisUserObj(body.players[localUserToken])
          setPastVotings(body.voteResults)
          const deckArray = [...new Set(body.deck.split(','))]
          setGameDeck(deckArray)
        } else if (messageData.event_type === 'updatedMessage') {
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
    //     console.log('Socket connection closed')
    // }
  }, [localUserToken])

  return (
    <GameContext.Provider
      value={{
        children,
        voteEvent,
        participantEvent,
        appIsLoading,
        setAppIsLoading,
        playersData,
        roomName,
        gameDeck,
        gameState,
        thisUserObj,
        pastVotings,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
