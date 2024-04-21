
import { Position, ServerCat, Player } from './serverEntity.js'
import { SquareBrain } from './cat_brain/brain.js'
import { ServerProtocol } from './protocol.js'
import { ClientConnection } from './connection.js'

export class Server {
  #connections
  #players
  #cats
  #startTime

  constructor() {
    this.#connections= []
    this.#players= new Map()
    this.#cats= [ new ServerCat( new Position( 280, 50 ), new SquareBrain() ) ]
    this.#startTime= -1
  }

  async playerJoined( socket ) {
    const connection= new ClientConnection( socket, new ServerProtocol() )
    this.#connections.push( connection )

    // TODO: Pick random spot in random tunnel (maybe distribute even among tunnels)
    const position= new Position( 200, 200 )
    const tunnel= 0

    const player= new Player( position, tunnel, connection )
    connection.onClose= () => this.playerLeft( player )

    await player.waitForConnection()

    this.#players.set( player.id, player )
    console.log( `Player '${player.id}' joined the game` )
  }

  playerLeft( player ) {
    const connectionIdx= this.#connections.indexOf( player.connection )
    if( connectionIdx >= 0 ) {
      this.#connections.splice(connectionIdx, 1)
    }
    
    this.#players.delete( player.id )
    console.log(`Player ${player.id} left the game`)
  }

  updateGameTime() {
    // Start timer when there is at least one player
    if( this.#startTime < 0 && this.#players.size > 0 ) {
      this.#startTime= Date.now()
    }

    // Timer stopped
    if( this.#startTime < 0 ) {
      return
    }

    // End the game when time runs out
    const gameDuration= 3* 60* 1000 // 3 minutes in ms
    const time= Date.now() - this.#startTime
    if( time > gameDuration ) {
      this.#players.forEach( player => player.kill() )
    }

    // Send time update message every second
    if( Math.floor(time) % 1000 < 100 ) {
      ServerProtocol.broadcastTime( this.#connections, Math.max(0, gameDuration- time) )
    }
  }

  update() {
    this.#cats.forEach( cat => cat.update() )

    this.updateGameTime()

    // Transmit current map state to players via broadcast
    const miceData= []
    this.#players.forEach( player => miceData.push( player.makePacket() ) )
    
    const catsData= this.#cats.map( cat => cat.makePacket() )

    ServerProtocol.broadcastEntityUpdates( this.#connections, miceData, catsData )

    // Transmit current votes to the players via broadcast
    const votes= {}
    this.#players.forEach( player => {
      const tunnelVote= player.vote
      if( !tunnelVote ) {
        return
      }

      // Ensure that property exists
      const tunnel= (votes[tunnelVote.tunnel]= votes[tunnelVote.tunnel] || {})
      tunnel[tunnelVote.vote]= (tunnel[tunnelVote.vote] || 0)+ 1
    })

    ServerProtocol.broadcastVoteUpdates( this.#connections, votes )

    this.#connections.forEach( connection => connection.sendMessages() )
  }
}
