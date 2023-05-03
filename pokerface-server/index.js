// ! IMPORTS
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const path = require('path')

//! Middleware
const join = path.join(__dirname, '.', 'build')
// console.log(join)
app.use(express.static(join))
app.use(express.json())
app.use(cors())


//! Socket server
const { startSocketServer } = require('./controllers/socketController')
startSocketServer()

//! Server listen
const { SERVER_PORT } = process.env
// db.sync().then(() => {
  app.listen(SERVER_PORT, () =>
    console.log(`SERVER RUNNING ON SERVER_PORT ${SERVER_PORT}`)
  )
// })

