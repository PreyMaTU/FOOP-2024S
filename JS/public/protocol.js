import { abstractMethod } from './util.js'

export class Protocol {
  #sendBuffer

  constructor() {
    this.#sendBuffer= []
  }

  set sendBuffer( buffer ) { this.#sendBuffer= buffer }

  _sendMessage( type, args= {} ) {
    args.type= type
    this.#sendBuffer.push( JSON.stringify( args ) )
  }

  sendHelloMessage() { abstractMethod() }
  handleIncomingMessage() { abstractMethod() }
}

export class ClientProtocol extends Protocol {
  #state
  #connectingPromise
  #id

  static State = {
    Unconnected: { name: 'unconnected' },
    Connected: { name: 'connected' }
  }

  constructor() {
    super()
    
    this.#state = ClientProtocol.State.Unconnected
    this.#connectingPromise = null
    this.#id= -1
  }

  get id() { return this.#id }

  sendHelloMessage() {
    this._sendMessage( 'hello' )
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
        this.#state = ClientProtocol.State.Connected
        this.#id= msg.id
        
        if (this.#connectingPromise) {
          this.#connectingPromise.res( this.#id )
          this.#connectingPromise = null
        }
        break
        
      case 'mousePositions':  // [ id, x, y, movementDirection, alive? ]       
        break
        
      case 'catPositions':    // [ id, x, y, movementDirection ]
        break
        
      case 'votes':           // tunnel id: { red: number, green: number, ... }, tunnel id: ....
        break
        
      case 'gameState':       // time remaining
        break
        
      default:
        console.error( `Received unknown message type '${msg.type}'`, msg )
        break
    }
  }

  async waitForConnection() {
    if (this.#state === ClientProtocol.State.Connected) {
      return this.#id
    }

    return new Promise((res, rej) => this.#connectingPromise = { res, rej })
  }
}
