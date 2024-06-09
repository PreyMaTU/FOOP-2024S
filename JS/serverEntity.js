
import { RunningDirection } from './public/actors.js'
import { Vector } from './public/util.js'

/**
 * Simple 2D integer position to describe the location of entities on
 * the map.
 */
export class Position {
  /**
   * Either act as a copy constructor or create a new position from
   * x and y values.
   * 
   * @param {number | Position} x 
   * @param {number} y 
   */
  constructor( x, y ) {
    if( x instanceof Position ) {
      this.x= x.x
      this.y= x.y
    } else {
      this.x= x
      this.y= y
    }

    this.#round()
  }

  #round() {
    this.x= Math.round(this.x* 10) / 10
    this.y= Math.round(this.y* 10) / 10
  }

  copy() {
    return new Position( this )
  }

  // Convert to a positional vector instance
  vector() {
    return new Vector( this.x, this.y )
  }

  // Move the Position by the given value
  // Takes either separate x and y values or a Vector as input 
  move( vec, y ) {
    if( vec instanceof Vector ) {
      this.x+= vec.x
      this.y+= vec.y
    } else {
      this.x+= vec
      this.y+= y
    }

    this.#round()
    return this
  }

  // Compute the current running direction based on a previous
  // position object
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

/**
 * Base class for moving server entities. Has an id, position and tracks its
 * running direction.
 */
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

/**
 * Class for the player entities (mice) connected to the game
 * as clients.
 */
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
  get tunnel() { return this.#tunnel }
  get alive() { return this.#alive }

  // Return the current vote only if the player is in a tunnel 
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

  kill() {
    this.#alive= false
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

/**
 * Cat NPC entity that tries to catch the player entities. The behavior is controlled
 * by a plugable brain instance, that is called every update cycle.
 */
export class ServerCat extends ServerEntity {
  #brain

  constructor( position, brain ) {
    super( position )
    this.#brain= brain
    this.#brain.init( position )
  }

  update() {
    // Check if there is a player close enough to kill
    const killDistance= 11+ 6- 4 // Half of each hitbox minus 2px each
    const hitboxCenter= this.position.copy().move( 11, 11 )
    const closestPlayer= Server.the().findClosestOvergroundAlivePlayer( hitboxCenter, killDistance )
    if( closestPlayer ) {
      closestPlayer.kill()
    }

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
