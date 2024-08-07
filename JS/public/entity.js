
import { abstractMethod, Vector } from './util.js'

/**
 * Describes the rectangular hitbox of an entity with a position
 * and extent.
 */
export class Hitbox {
  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} w 
   * @param {number} h 
   */
  constructor(x, y, w, h) {
    this.x= x
    this.y= y
    this.w= w
    this.h= h
  }

  get centerX() { return this.x+ Math.floor(this.w/2) }
  get centerY() { return this.y+ Math.floor(this.h/2) }

  set centerX( x ) { return this.x= x - Math.floor(this.w/2) }
  set centerY( y ) { return this.y= y - Math.floor(this.h/2) }

  /** 
   * Check if two Hitboxes overlap
   * @param {Hitbox} other 
   */
  overlapsWith( other ) {
    // Hitbox has no area -> no overlap
    if( !this.w || !this.h || !other.w || !other.h ) {
      return false
    }

    // Hitboxes to the left of each other -> no overlap
    if(this.x > other.x + other.w || other.x > this.x + this.w) {
      return false
    }

    // Hitboxes are on top of each other -> no overlap
    if (this.y > other.y + other.h || other.y > this.y + this.h) {
      return false
    }

    return true
  }

  // Forces the position to be inside rectangular bounds
  clampPosition(minLeft, minTop, maxRight, maxBottom) {
    this.x= Math.max( minLeft, Math.min(maxRight- this.w, this.x))
    this.y= Math.max( minTop, Math.min(maxBottom- this.h, this.y))
  }

  move( x, y ) {
    this.x+= x
    this.y+= y
  }

  // Draws the hitbox as a red bordered rectangle
  draw() {
    const renderer= Game.the().renderer
    renderer.pushState()
    renderer.strokeWeight= 2
    renderer.strokeColor= 'red'
    renderer.noFill()

    renderer.drawRectangle( this.x, this.y, this.w, this.h )

    renderer.popState()
  }
}


/**
 * Smoothly moves a hitbox from a current position to a set
 * target position linearly with a set speed.
 */
export class LinearSteerer {
  #speed
  #target

  /** @param {speed} number */
  constructor( speed ) {
    this.#speed= speed
    this.#target= null
  }

  /**
   * Set a new target position
   * 
   * @param {Hitbox} hitbox
   * @param {number} x
   * @param {number} y
   */
  setTarget( hitbox, x, y ) {
    // Do not set a target when the hitbox already reached the target
    if( hitbox.x === x && hitbox.y === y ) {
      this.#target= null
      return
    }

    this.#target= new Vector( x, y )
  }

  /**
   * Move the hitbox towards the target position, if one
   * is currently set.
   * 
   * @param {Hitbox} hitbox
   * @param {number} timeDelta
   */
  updateHitbox( hitbox, timeDelta ) {
    if( !this.#target ) {
      return
    }

    // Calculate the full vector and scaled movement vector
    const vec= this.#target.sub( new Vector( hitbox.x, hitbox.y ) )
    const movement= this.#speed * timeDelta

    // Just set the hitbox to the target position when the distance is greater
    // than what we could cover in 20 frames, or if the movement would overshoot
    // the target
    const distance= vec.length()
    if(distance > 1000 *20/60 * this.#speed || distance <= movement ) {
      hitbox.x= this.#target.x
      hitbox.y= this.#target.y
      this.#target= null
      return
    }

    const scaled= vec.unit().scale( movement )
    hitbox.move( scaled.x, scaled.y )
  }
}

/**
 * Abstract base class for all entities displayed by the game.
 * This also includes inanimate objects such as tunnels.
 */
export class Entity {
  draw() { abstractMethod() }
  update() {}
  get hitbox() { abstractMethod() }

  drawHitboxIfEnabled() {
    if( Game.the().showHitboxes ) {
      this.hitbox.draw()
    }
  }
}
