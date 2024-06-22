
import { Brain } from "./brain.js"

/**
 * Cat behavior to pursue the nearest player mouse that is overground.
 */
export class LazyBrain extends Brain {
  #speed
  #focusedPlayer
  #updateSteps

  constructor( speed ) {
    super()
    this.#speed= speed
    this.#updateSteps= 0
    this.#focusedPlayer= null
  }

  init() {
    this.#updateSteps= 0
    this.#focusedPlayer= null
  }

  update( position ) {
    let newPosition= position.copy()

    // Pick new player mouse as target if none is focused, the focused player mouse is dead,
    // or ten update steps have passed (another mouse might be closer)
    if( !this.#focusedPlayer || !this.#focusedPlayer.alive || !this.#updateSteps ) {
      this.#focusedPlayer= Server.the().findClosestOvergroundAlivePlayer( position.copy().move(11, 11) )
    }

    this.#updateSteps= (this.#updateSteps + 1) % 10

    // When we do not have a player mouse we just sit and wait
    if( !this.#focusedPlayer ) {
      return newPosition
    }

    const posVec= position.vector()
    const targetVec= this.#focusedPlayer.position.vector()

    // Prevent overshooting of target by jumping to positions closer than the
    // movement vector
    if( posVec.distanceToSquared( targetVec ) < this.#speed * this.#speed ) {
      newPosition= new position( targetVec.x, targetVec.y )
      
    } else {
      const movementVec= targetVec.sub( posVec ).unit().scale( this.#speed )
      newPosition.move( movementVec )
    }

    return newPosition
  }
}
