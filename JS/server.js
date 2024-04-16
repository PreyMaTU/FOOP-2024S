import { Protocol } from "./public/Protocol.js"
import { RunningDirection } from "./public/actors.js"

class Position {
  constructor( x, y ) {
    this.x= x
    this.y= y
  }

  runningDirection( previous ) {
    const dx= this.x - previous.x
    const dy= this.y - previous.y
    if( dx > 0 ) {
      return RunningDirection.Right

    } else if( dx < 0 ) {
      return RunningDirection.Left

    } else if( dy > 0 ) {
      return RunningDirection.Down

    } else if( dy < 0 ) {
      return RunningDirection.Up

    } else {
      return null
    }
  }
}

class ServerProtocol extends Protocol {
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
    this._sendMessage( 'hello', { id: this.id } )
  }

  handleIncomingMessage( textMessage ) {
    let msg= null
    try {
      msg= JSON.parse( textMessage )
    } catch( e ) {
      console.error( 'Could not parse JSON message:', textMessage )
      return
    }
      
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
        
      default:
        console.error( `Received unknown message type '${msg.type}' from '${msg.id}'`, msg )
        break
    }
  }

  async waitForConnection() {
    await this._waitForState( ServerProtocol.State.Connected )
  }
}

class ClientConnection {
  #socket
  #protocol
  #sendBuffer

  constructor( socket, protocol ) {
    this.#socket= socket
    this.#socket.on('connect', () => { console.log('Websocket connected') })
    this.#socket.on('message', msg => this.#protocol.handleIncomingMessage( msg ) )
    this.#socket.on('close', () => this.#onWebsocketClosed() )
    this.#socket.on('error', error => console.error('Websocket error:', error) )
    
    this.#sendBuffer = []
    this.#protocol= protocol
    this.#protocol.sendBuffer= this.#sendBuffer
    this.onClose= null
  }

  #onWebsocketClosed() {
    console.log('Websocket closed')
    if( this.onClose ) {
      this.onClose( this )
    }
  }

  sendMessages( broadcastMessages= [] ) {
    this.#sendBuffer.forEach( textMessage => this.#socket.send( textMessage ) )
    this.#sendBuffer.length= 0

    broadcastMessages.forEach( textMessage => this.#socket.send( textMessage ) )
  }

  setPlayer( player ) {
    this.#protocol.player= player
  }

  async waitForConnection() {
    await this.#protocol.waitForConnection()
  }
}

class ServerEntity {
  #id
  #position
  #runningDirection

  static idCounter= 0

  constructor( position ) {
    this.#id= ServerEntity.idCounter++
    this.#position= position
    this.#runningDirection= null
  }

  get id() { return this.#id }
  get position() { return this.#position }
  get runningDirection() { return this.#runningDirection }

  set position( newPosition ) {
    this.#runningDirection= newPosition.runningDirection( this.#position )
    this.#position= newPosition
  }
}

class Player extends ServerEntity {
  #vote
  #tunnel
  #alive
  #connection

  constructor( position, tunnel, connection ) {
    super( position )
    this.#vote= null
    this.#tunnel= tunnel
    this.#alive= true
    this.#connection= connection
    this.#connection.setPlayer( this )
  }

  get connection() { return this.#connection }

  async waitForConnection() {
    await this.#connection.waitForConnection()
  }

  update( position, tunnelColor, voteColor ) {
    this.position= position
    this.#tunnel= tunnelColor
    this.#vote= voteColor

    console.log(`Player update:`, this.runningDirection)
  }
}

class ServerCat extends ServerEntity {
  #brain

  constructor( position, brain ) {
    super( position )
    this.#brain= brain
  }
}

export class Server {
  #connections
  #players
  #cats
  #gameTime

  constructor() {
    this.#connections= []
    this.#players= new Map()
    this.#cats= []
    this.#gameTime= 0
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

  update() {
    const broadcastMessages= []


    this.#connections.forEach( connection => connection.sendMessages( broadcastMessages ) )
  }
}
