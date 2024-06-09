
import { Position, ServerCat, Player } from './serverEntity.js'
import { SquareBrain } from './cat_brain/squareBrain.js'
import { StalkerBrain } from './cat_brain/stalkerBrain.js'
import { ServerProtocol } from './protocol.js'
import { ClientConnection } from './connection.js'
import { Vector, sampleArray, sampleSubArray } from './public/util.js'
import { playfieldMap } from './playfieldMap.js'

// Enum of allowed game states
const GameState= {
  Pending: {name: 'pending'},
  Running: {name: 'running'},
  Victory: {name: 'victory'},
  Loss: {name: 'loss'}
}

/**
 * The main server class. Stores the game's state, entities and client
 * connections. Handles incoming events processed by the client protocol
 * and controls the progress of the game. Detects when players (mice) 
 * are caught by cats, runs the cat AIs and broadcasts game updates.
 * The server is implemented as a singleton.
 */
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
  
  // Return the instance of the server singleton
  static the() {
    return Server.instance
  }

  // Initialize the game server with two cats
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

  // Get a random position in the tunnel with least player mice
  pickRandomPositionInsideTunnel() {
    // Count the number of mice in each tunnel
    const tunnelOccupation= {}
    for( const tunnel of playfieldMap.tunnels ) {
      tunnelOccupation[tunnel.color]= 0
    }
    this.#players.forEach( player => { 
      if( player.tunnel ) {
        tunnelOccupation[player.tunnel]++
      }
    })

    // Find the set of tunnels with the lowest number
    // of mice in them
    const emptyTunnels= []
    let lowestOccupation= Number.MAX_SAFE_INTEGER
    for( const tunnel of playfieldMap.tunnels ) {
      const occupation= tunnelOccupation[ tunnel.color ]
      if( occupation === lowestOccupation ) {
        emptyTunnels.push( tunnel )
      } else if( occupation < lowestOccupation ) {
        emptyTunnels.length= 0
        emptyTunnels.push( tunnel )
        lowestOccupation= occupation
      }
    }

    // Pick a random tunnel from the viable ones, and pick
    // a random spot in a random section of the tunnel
    const tunnel= sampleArray( emptyTunnels )
    const [start, end]= sampleSubArray( tunnel.geometry, 2 )
    const randomOffset= new Vector(end).sub( new Vector(start) ).scale(Math.random())
    const position= new Position( start[0], start[1] ).move( randomOffset )

    return { position, tunnel: tunnel.color }
  }

  // Handle player joining the game
  async playerJoined( socket ) {
    const connection= new ClientConnection( socket, new ServerProtocol() )
    this.#connections.push( connection )

    // Spawn player mouse inside a tunnel with least other players
    const { position, tunnel }= this.pickRandomPositionInsideTunnel()
    const player= new Player( position, tunnel, connection )
    connection.onClose= () => this.playerLeft( player )

    await player.waitForConnection()

    this.#players.set( player.id, player )
    console.log( `Player '${player.id}' joined the game` )

    // Start the game after first player joined
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

  // Handle player leaving the game
  playerLeft( player ) {
    // Remove connection from the array
    const connectionIdx= this.#connections.indexOf( player.connection )
    if( connectionIdx >= 0 ) {
      this.#connections.splice(connectionIdx, 1)
    }
    
    // Remove the player from the map
    this.#players.delete( player.id )
    console.log(`Player ${player.id} left the game`)
  }

  // Count the votes for each tunnel
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

  // Update the game timer and broadcast the time every second. When
  // no time is left the game ends and all player are killed.
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

  // When winning conditions are met end the game and broadcast to all clients
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
    
    // At least two players must be alive for the game to be won
    if( alivePlayers >= 2 ) {
      this.#state= GameState.Victory
      ServerProtocol.broadcastVictory( this.#connections )
    }
  }

  // When all players are dead the game ends
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

  // Main update loop
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

  // Finds the closest player above ground that is still alive with an optional maximum
  // radius
  findClosestOvergroundAlivePlayer( position, maxDistance= Number.POSITIVE_INFINITY ) {
    const posVec= position.vector()
    let closestPlayer= null
    let closestSquaredDistance= maxDistance* maxDistance

    // Check distance for each player alive and overground
    const mouseHitboxCenterOffset= new Vector( 6, 6 )
    this.#players.forEach( player => {
      if( !player.alive || player.tunnel ) {
        return
      }

      // Calculate distance of current player to given position
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
