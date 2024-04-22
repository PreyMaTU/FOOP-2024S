
import { Position, ServerCat, Player } from './serverEntity.js'
import { SquareBrain } from './cat_brain/squareBrain.js'
import { StalkerBrain } from './cat_brain/stalkerBrain.js'
import { ServerProtocol } from './protocol.js'
import { ClientConnection } from './connection.js'
import { Vector } from './public/util.js'

const GameState= {
  Pending: {name: 'pending'},
  Running: {name: 'running'},
  Victory: {name: 'victory'},
  Loss: {name: 'loss'}
}

export class Server {
  #connections
  #players
  #cats
  #startTime
  #state

  static instance= null

  static create() {
    return Server.instance= new Server()
  }
  
  static the() {
    return Server.instance
  }

  constructor() {
    this.#connections= []
    this.#players= new Map()
    this.#cats= [
      new ServerCat( new Position( 40, 30 ), new SquareBrain(240, 90, 6, 0.006) ),
      new ServerCat( new Position( 180, 90 ), new StalkerBrain( 3 ) )
    ]
    this.#state= GameState.Pending
    this.#startTime= 0
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

    // Start the game
    if( this.#state === GameState.Pending ) {
      this.#startTime= Date.now()
      this.#state= GameState.Running
    }

    // The game has already ended
    if( this.#state !== GameState.Pending && this.#state !== GameState.Running ) {
      console.log( `... but game has already ended` )
      player.kill()
      return
    }
  }

  playerLeft( player ) {
    const connectionIdx= this.#connections.indexOf( player.connection )
    if( connectionIdx >= 0 ) {
      this.#connections.splice(connectionIdx, 1)
    }
    
    this.#players.delete( player.id )
    console.log(`Player ${player.id} left the game`)
  }

  countVotes() {
    const votes= {}
    this.#players.forEach( player => {
      const tunnelVote= player.vote
      if( !tunnelVote ) {
        return
      }

      // Either get or create entry for the tunnel
      const tunnel= (votes[tunnelVote.tunnel]= votes[tunnelVote.tunnel] || {})
      // Increment (and create) vote count for the color on the tunnel entry
      tunnel[tunnelVote.vote]= (tunnel[tunnelVote.vote] || 0)+ 1
    })

    return votes
  }

  updateGameTime() {
    // Timer stopped
    if( this.#state !== GameState.Running ) {
      return
    }

    // End the game when time runs out
    const gameDuration= 3* 60* 1000 // 3 minutes in ms
    const time= Date.now() - this.#startTime
    if( time > gameDuration ) {
      this.#state= GameState.Loss
      this.#players.forEach( player => player.kill() )
    }

    // Send time update message every second
    if( Math.floor(time) % 1000 < 100 ) {
      ServerProtocol.broadcastTime( this.#connections, Math.max(0, gameDuration- time) )
    }
  }

  detectVictory() {
    if( this.#state !== GameState.Running ) {
      return
    }

    // All alive players (at least 2) have to be in the same tunnel
    let tunnel= null
    let alivePlayers= 0
     for( const player of this.#players.values() ) {
      if( !player.alive ) {
        continue
      }  

      // The first player dictates the tunnel
      if( !alivePlayers ) {
        tunnel= player.tunnel
      }

      alivePlayers++

      // At least one player is not in the same tunnel
      if( !tunnel || player.tunnel !== tunnel ) {
        return
      }
    }
    
    if( alivePlayers >= 2 ) {
      this.#state= GameState.Victory
      ServerProtocol.broadcastVictory( this.#connections )
    }
  }

  detectLoss() {
    if( this.#state !== GameState.Running ) {
      return
    }

    // Check if all players are dead
    let allDead= true
    this.#players.forEach( player => allDead &&= !player.alive )
    if( allDead ) {
      this.#state= GameState.Loss
    }
  }

  update() {
    this.#cats.forEach( cat => cat.update() )

    this.updateGameTime()
    this.detectVictory()
    this.detectLoss()

    // Transmit current map state to players via broadcast
    const miceData= []
    this.#players.forEach( player => miceData.push( player.makePacket() ) )
    
    const catsData= this.#cats.map( cat => cat.makePacket() )

    ServerProtocol.broadcastEntityUpdates( this.#connections, miceData, catsData )

    // Transmit current votes to the players via broadcast
    const votes= this.countVotes()
    ServerProtocol.broadcastVoteUpdates( this.#connections, votes )

    this.#connections.forEach( connection => connection.sendMessages() )
  }

  findClosestOvergroundAlivePlayer( position, maxDistance= Number.POSITIVE_INFINITY ) {
    const posVec= position.vector()
    let closestPlayer= null
    let closestSquaredDistance= maxDistance* maxDistance

    const mouseHitboxCenterOffset= new Vector( 6, 6 )
    this.#players.forEach( player => {
      if( !player.alive || player.tunnel ) {
        return
      }

      const distance= player.position.vector().add( mouseHitboxCenterOffset ).distanceToSquared( posVec )
      if( distance < closestSquaredDistance ) {
        closestPlayer= player
        closestSquaredDistance= distance
      }
    })

    return closestPlayer
  }
}

global.Server= Server
