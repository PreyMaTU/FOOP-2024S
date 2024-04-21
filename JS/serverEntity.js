
import { RunningDirection } from './public/actors.js'

export class Position {
  constructor( x, y ) {
    if( x instanceof Position ) {
      this.x= x.x
      this.y= x.y
      return
    }

    this.x= Math.round(x* 10) / 10
    this.y= Math.round(y* 10) / 10
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

export class Player extends ServerEntity {
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

  get vote() {
    return this.#tunnel && this.#vote
      ? { tunnel: this.#tunnel, vote: this.#vote } : null
  }

  async waitForConnection() {
    await this.#connection.waitForConnection()
  }

  update( position, tunnelColor, voteColor ) {
    this.position= position
    this.#tunnel= tunnelColor || null
    this.#vote= voteColor || null
  }

  makePacket() {
    return {
      id: this.id,
      x: this.position.x,
      y: this.position.y,
      runningDirection: this.runningDirection?.name || null,
      tunnel: this.#tunnel,
      alive: this.#alive
    }
  }
}

export class ServerCat extends ServerEntity {
  #brain

  constructor( position, brain ) {
    super( position )
    this.#brain= brain
    this.#brain.init( position )
  }

  update() {
    this.position= this.#brain.update( this.position )
  }

  makePacket() {
    return {
      id: this.id,
      x: this.position.x,
      y: this.position.y,
      runningDirection: this.runningDirection?.name || null
    }
  }
}