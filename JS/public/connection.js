
/**
 * Buffer incoming messages from the server. Uses double buffering so a known set 
 * of messages can be processed while new ones get stored for the next update cycle.
 */
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

/**
 * Buffered connection from the client to the server. Messages are not interpreted
 * by the connection itself, but handed through to a protocol instance, which generates
 * events for various parts of the game. Incoming messages are held in a double buffer
 * so every update cycle a defined number of messages get processed synchronously. 
 * Responses are queued and sent at once every update cycle.
 */
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

  get protocol() { return this.#protocol }

  // Opens a connection to the server web socket and sets up event handler callbacks.
  // When the connection is established the protocol is begun by sending a hello-
  // message to the server.
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

  // Put received messages into the receiver buffer
  #handleMessage( event ) {
    this.#receiver.push( event.data )
  }

  #handleError( event ) {
    console.error( 'Websocket error:', event )
  }

  // Wait for the connection to be established, after 'open()' was called. As this method
  // is used outside the main game loop, events have to pumped manually.
  async waitForConnection() {
    this.frameSendMessagesAndToggleBuffer()
    const messagePump= setInterval( () => this.updateGameFromMessages(), 100 )
    try {
      return await this.#protocol.waitForConnection()
    } finally {
      clearInterval( messagePump )
    }
  }

  // Process the collected messages by ingesting them into the protocol instance
  updateGameFromMessages() {
    this.#receiver.currentBuffer.forEach( textMessage => this.#protocol.handleIncomingMessage( textMessage ) )
  }

  // Send the queued messages to the server and swap the incoming message's buffer.
  // This needs to be called once every frame.
  frameSendMessagesAndToggleBuffer() {
    // Send all messages in the send buffer and clear the send buffer
    if( this.#socket.readyState === 1 ) {
      this.#sendBuffer.forEach( textMessage => this.#socket.send( textMessage ) )
    }
    this.#sendBuffer.length= 0

    this.#receiver.swapReceiveBuffers()
  }
}
