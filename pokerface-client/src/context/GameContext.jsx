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
  const [gameName, setGameName] = useState('')

  console.success = function(message) {
    console.log("%c✅ " + message, "color: #04A57D; font-weight: bold;")
  }
  console.warning = function(message) {
    console.log("%c⚠️ " + message, "color: yellow; font-weight: bold;")
  }

  let connectCounter = 0
  const localUserToken = localStorage.getItem('localUserToken')
  useEffect(() => {
    console.log('socket use effect started')
    function connectClient() {
      const ws = new WebSocket('ws://localhost:8086')

      ws.addEventListener('open', function () {
        if (connectCounter > 0) console.success('Reconnected to socket server')
        send(ws, 'newLocalPlayer', {
          localUserToken,
        })
      })

      ws.addEventListener('message', function (event) {
        if (!event?.data) return
        let messageData = JSON.parse(event.data)
        console.log('messageData: ', messageData)
        if (messageData.event_type === 'newMessage') {

        } else if (messageData.event_type === 'updatedMessage') {

        } else if (messageData.event_type === 'newReaction') {

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
  }, [localUserToken])

  return (
    <GameContext.Provider
      value={{
        children,
        voteEvent,
        participantEvent,
        appIsLoading,
        setAppIsLoading,
        gameName,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
