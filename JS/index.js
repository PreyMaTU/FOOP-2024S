
import dotenv from 'dotenv';
import express from 'express';
import expressWs from 'express-ws'
import { Server } from './server.js';
import { playfieldMap } from './playfieldMap.js'

// Load config from env file
dotenv.config()

// Create web server with websocket capability
const app = express()
app.use( express.static('public') )
expressWs( app )

const server= Server.create()

// Endpoint for live game data
app.ws('/socket', (ws, req) => server.playerJoined( ws ) )

// Endpoint to get the layout of the map
app.get('/map', (req, res) => res.send(playfieldMap) )

// Start the web server
const port= parseInt( process.env.PORT )
app.listen(port, () => {
  console.log(`Cat mouse game server listening on port ${port}`)
})

// The game update loop
setInterval( () => server.update(), 100 )
