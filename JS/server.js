import { Protocol } from "./public/Protocol.js"

class Position {
  constructor( x, y ) {
    this.x= x
    this.y= y
  }
}

class ServerProtocol extends Protocol {
  #state
  #connectingPromise

  static State= {
    Unconnected: {name: 'unconnected'},
    Connected: {name: 'connected'}
  }

  constructor() {
    super()
    this.#state= ServerProtocol.State.Unconnected
    this.#connectingPromise= null


    this.id= -1
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
        this.#state= ServerProtocol.State.Connected
        if( this.#connectingPromise ) {
          this.#connectingPromise.res()
          this.#connectingPromise= null
        }
        break
        
      default:
        console.error( `Received unknown message type '${msg.type}' from '${msg.id}'`, msg )
        break
    }
  }

  async waitForConnection() {
    if( this.#state === ServerProtocol.State.Connected ) {
      return
    }

    return new Promise((res, rej) => this.#connectingPromise= { res, rej })
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
    this.#socket.on('close', () => { console.log('Websocket closed') /* TODO: Unalive Player? */ })
    this.#socket.on('error', error => console.error('Websocket error:', error) )
    
    this.#sendBuffer = []
    this.#protocol= protocol
    this.#protocol.sendBuffer= this.#sendBuffer
  }

  sendMessages( broadcastMessages= [] ) {
    this.#sendBuffer.forEach( textMessage => this.#socket.send( textMessage ) )
    this.#sendBuffer.length= 0

    broadcastMessages.forEach( textMessage => this.#socket.send( textMessage ) )
  }

  setProtocolId( id ) {
    this.#protocol.id= id
  }

  async waitForConnection() {
    await this.#protocol.waitForConnection()
  }
}

class ServerEntity {
  #id

  static idCounter= 0

  constructor() {
    this.#id= ServerEntity.idCounter++
  }

  get id() { return this.#id }
}

class Player extends ServerEntity {
  #position
  #vote
  #tunnel
  #alive
  #connection

  constructor( position, tunnel, connection ) {
    super()
    this.#position= position
    this.#vote= null
    this.#tunnel= tunnel
    this.#alive= true
    this.#connection= connection
    this.#connection.setProtocolId( this.id )
  }

  async waitForConnection() {
    await this.#connection.waitForConnection()
  }
}

class ServerCat extends ServerEntity {
  #position
  #brain

  constructor( position, brain ) {
    super()
    this.#position= position
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
    await player.waitForConnection()

    this.#players.set( player.id, player )
    console.log( `Player '${player.id}' joined the game` )
  }

  update() {
    const broadcastMessages= []


    this.#connections.forEach( connection => connection.sendMessages( broadcastMessages ) )
  }
}
