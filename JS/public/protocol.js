import { abstractMethod } from './util.js'

export class Protocol {
  #sendBuffer
  #state
  #awaitedState
  #pendingPromise

  constructor( state ) {
    this.#state= state
    this.#awaitedState= null
    this.#pendingPromise= null
    this.#sendBuffer= []
  }

  get state() { return this.#state }
  set sendBuffer( buffer ) { this.#sendBuffer= buffer }

  _sendMessage( type, args= {} ) {
    args.type= type
    this.#sendBuffer.push( JSON.stringify( args ) )
  }

  async _waitForState( expectedState ) {
    if( expectedState === this.#state ) {
      return
    }

    if( this.#awaitedState ) {
      throw new Error('Can only wait for one state at a time')
    }

    this.#awaitedState= expectedState
    return new Promise( (res, rej) => this.#pendingPromise= {res, rej} )
  }

  _setState( newState, value ) {
    if( newState === this.#awaitedState && this.#pendingPromise ) {
      this.#pendingPromise.res( value )
      this.#pendingPromise= null
      this.#awaitedState= null
    }

    this.#state= newState
  }

  sendHelloMessage() { abstractMethod() }
  handleIncomingMessage() { abstractMethod() }
}

export class ClientProtocol extends Protocol {
  #id

  static State = {
    Unconnected: { name: 'unconnected' },
    Connected: { name: 'connected' }
  }

  constructor() {
    super( ClientProtocol.State.Unconnected )
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
        this.#id= msg.id
        this._setState( ClientProtocol.State.Connected )
        break
        
      case 'entities':        // mice: [ {id, x, y, movementDirection, alive} ], cats: [ {id, x, y, movementDirection} ]
        Game.the()?.playfield.receivedEntitiesMessage( msg.mice, msg.cats )
        break
        
      case 'votes':           // tunnel color: { red: number, green: number, ... }, tunnel color: ....
        Game.the()?.receivedVotesMessage( msg.votes )
        break
        
      case 'time':           // time: time
        Game.the()?.receivedTimeMessage( msg.time )
        break
        
      default:
        console.error( `Received unknown message type '${msg.type}'`, msg )
        break
    }
  }

  async waitForConnection() {
    await this._waitForState( ClientProtocol.State.Connected )
    return this.#id
  }

  sendPlayerUpdate( playerX, playerY, tunnelColor, voteColor ) {
    if( this.state === ClientProtocol.State.Connected ) {
      this._sendMessage('player', {playerX, playerY, tunnelColor, voteColor})
    }
  }

  sendQuitMessage() {
    if( this.state === ClientProtocol.State.Connected ) {
      this._sendMessage('quit')
    }
  }
}
