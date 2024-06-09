
import { ClientProtocol } from './public/protocol.js'

/**
 * Buffered connection from the server to the client. Messages are not interpreted
 * by the connection itself, but handed through to a protocol instance, which generates
 * events for the server and player objects. Responses are queued and sent at once every
 * update cycle.
 */
export class ClientConnection {
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

  get protocol() { return this.#protocol }

  // Handler for closed websocket
  #onWebsocketClosed() {
    console.log('Websocket closed')
    if( this.onClose ) {
      this.onClose( this )
    }
  }

  // Send queued messages to the client
  sendMessages() {
    this.#sendBuffer.forEach( textMessage => this.#socket.send( textMessage ) )
    this.#sendBuffer.length= 0
  }

  // Give the player to the protocol as context
  setPlayer( player ) {
    this.#protocol.player= player
  }

  // Wait for connection handshake
  async waitForConnection() {
    await this.#protocol.waitForConnection()
  }
}
