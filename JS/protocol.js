
import { Protocol } from './public/protocol.js'
import { Position } from './serverEntity.js'


/**
 * Server sided protocol for communicating with the client. In the beginning
 * a hello-handshake is performed to establish the connection. The client
 * send messages to update the player position, and the server regularly
 * updates the game state/map.
 */
export class ServerProtocol extends Protocol {
  #id
  #player

  static State= {
    Unconnected: {name: 'unconnected'},
    Connected: {name: 'connected'}
  }

  constructor() {
    super( ServerProtocol.State.Unconnected )

    this.#id= -1
    this.#player= null
  }

  set player( player ) {
    this.#id= player.id
    this.#player= player
  }

  sendHelloMessage() {
    this._sendMessage( 'hello', { id: this.#id } )
  }

  handleIncomingMessage( textMessage ) {
    // Try to parse the incoming message text as JSON
    let msg= null
    try {
      msg= JSON.parse( textMessage )
    } catch( e ) {
      console.error( 'Could not parse JSON message:', textMessage )
      return
    }
    
    // Handle different message types
    switch( msg.type ) {
      case 'hello':
        this.sendHelloMessage()
        this._setState( ServerProtocol.State.Connected )
        break

      case 'player':
        if( this.state === ServerProtocol.State.Connected ) {
          this.#player.update( new Position( msg.playerX, msg.playerY ), msg.tunnelColor, msg.voteColor )
        }
        break
        
      
      case 'quit':
        if( this.state === ServerProtocol.State.Connected ) {
          this.#player.kill()
        }
        break

      default:
        console.error( `Received unknown message type '${msg.type}' from '${msg.id}'`, msg )
        break
    }
  }

  async waitForConnection() {
    await this._waitForState( ServerProtocol.State.Connected )
  }

  /* Broadcast game data updates to the connected clients */

  static broadcastEntityUpdates( connections, mice, cats ) {
    connections.forEach( connection => connection.protocol._sendMessage('entities', {mice, cats}) )
  }

  static broadcastVoteUpdates( connections, votes ) {
    connections.forEach( connection => connection.protocol._sendMessage('votes', {votes}) )
  }

  static broadcastTime( connections, time ) {
    connections.forEach( connection => connection.protocol._sendMessage('time', {time}) )
  }

  static broadcastVictory( connections ) {
    connections.forEach( connection => connection.protocol._sendMessage('victory') )
  }
}
