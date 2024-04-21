
import { ClientProtocol } from './public/protocol.js'

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

  #onWebsocketClosed() {
    console.log('Websocket closed')
    if( this.onClose ) {
      this.onClose( this )
    }
  }

  sendMessages() {
    this.#sendBuffer.forEach( textMessage => this.#socket.send( textMessage ) )
    this.#sendBuffer.length= 0
  }

  setPlayer( player ) {
    this.#protocol.player= player
  }

  async waitForConnection() {
    await this.#protocol.waitForConnection()
  }
}
