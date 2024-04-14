
import dotenv from 'dotenv';
import express from 'express';
import expressWs from 'express-ws'
import { Server } from './server.js';
import { playfieldMap } from './playfieldMap.js'

dotenv.config()

const app = express()
app.use( express.static('public') )
expressWs( app )

const server= new Server()
app.ws('/socket', (ws, req) => server.playerJoined( ws ) )

app.get('/map', (req, res) => res.send(playfieldMap) )

const port= parseInt( process.env.PORT )
app.listen(port, () => {
  console.log(`Cat mouse game server listening on port ${port}`)
})


setInterval( () => server.update(), 100 )
