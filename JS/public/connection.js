
export class Receiver {
  #receiveBuffers
  #receiveBufferIndex

  constructor() {
    this.#receiveBuffers= [[], []]
    this.#receiveBufferIndex= 0
  }

  get currentBuffer() {
    return this.#receiveBuffers[this.#receiveBufferIndex]
   }

  push( msg ) {
    this.currentBuffer.push( msg )
  }

  swapReceiveBuffers() {
    // Clear receive buffer and swap
    this.currentBuffer.length= 0
    this.#receiveBufferIndex= (this.#receiveBufferIndex+ 1) % this.#receiveBuffers.length
  }
}

export class ServerConnection {
  #url
  #protocol
  #receiver
  #socket
  #sendBuffer

  constructor( url, protocol ) {
    this.#url= url
    this.#socket= null
    this.#receiver = new Receiver()

    this.#sendBuffer= []
    this.#protocol= protocol
    this.#protocol.sendBuffer= this.#sendBuffer
  }

  async open() {
    // Create a promise so we can wait for the websocket and resolve, when it is open
    return new Promise((res, rej) => {
      try {
        this.#socket= new WebSocket( this.#url )
        this.#socket.addEventListener('message', event => this.#handleMessage( event ) )
        this.#socket.addEventListener('open', event => {
          this.#handleOpen( event )
          // Resolve the promise once and remove the handles to it, so it can be GCed
          if( res ) {
            res()
          }
          res= null
          rej= null
        })
        
        this.#socket.addEventListener('error', event => {
          this.#handleError( event )
          if( rej ) {
            rej( event )
          }
          res= null
          rej= null
        })

      } catch( e ) {
        rej( e )
        res= null
        rej= null
      }
    })
  }

  #handleOpen( event ) {
    this.#protocol.sendHelloMessage()
  }

  #handleMessage( event ) {
    this.#receiver.push( event.data )
  }

  #handleError( event ) {
    console.error( 'Websocket error:', event )
  }

  async waitForConnection() {
    this.frameSendMessagesAndToggleBuffer()
    const messagePump= setInterval( () => this.updateGameFromMessages(), 100 )
    try {
      return await this.#protocol.waitForConnection()
    } finally {
      clearInterval( messagePump )
    }
  }

  updateGameFromMessages() {
    this.#receiver.currentBuffer.forEach( textMessage => this.#protocol.handleIncomingMessage( textMessage ) )
  }

  frameSendMessagesAndToggleBuffer() {
    // Send all messages in the send buffer and clear the send buffer
    this.#sendBuffer.forEach( textMessage => this.#socket.send( textMessage ) )
    this.#sendBuffer.length= 0

    this.#receiver.swapReceiveBuffers()
  }
}
