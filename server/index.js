// ! IMPORTS
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require('path')
const os = require('os')
const {
  startSocketServer,
  extractToken,
  createNewGame,
  uploadCloudinaryImage,
  deleteCloudinaryImage,
  emailDev,
} = require('./controllers/socketController')

//! Middleware
function createApp() {
  const app = express()
  const join = path.join(__dirname, '.', 'build')
  app.use(express.static(join))
  app.use(express.json())
  app.use(cors())

//! Endpoints

  app.put('/game/upload_image', extractToken, uploadCloudinaryImage)
  app.delete('/game/delete_image', extractToken, deleteCloudinaryImage)
  app.post('/game/create', extractToken, createNewGame)
  app.post('/contact', extractToken, emailDev)

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '.', 'build', 'index.html'))
  })

  return app
}

//! Server listen
function startServer() {
  const app = createApp()
  const PORT = process.env.PORT || 8080
  const USE_LOCAL_IP = process.env.USE_LOCAL_IP === 'true'
  let host

  if (USE_LOCAL_IP) {
    host = getLocalIPAddress()
  }

  if (host) {
    return startSocketServer(app, PORT, host)
  } else {
    return startSocketServer(app, PORT)
  }
}

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        // Only consider IPv4 addresses and exclude internal (localhost)
        return alias.address
      }
    }
  }
  return null
}

if (require.main === module) {
  startServer()
}

module.exports = { createApp, startServer }
