
import { Brain } from "./brain.js"

export class StalkerBrain extends Brain {
  #speed
  #focusedPlayer
  #lastOvergroundPlayerPosition

  constructor( speed ) {
    super()
    this.#focusedPlayer= null
    this.#speed= speed
  }

  init() {}

  update( position ) { 
    let newPosition= position.copy()

    if( !this.#focusedPlayer || !this.#focusedPlayer.alive ) {
      this.#focusedPlayer= Server.the().findClosestOvergroundAlivePlayer( position.copy().move(11, 11) )
    }
    
    if( !this.#focusedPlayer ) {
      return newPosition
    }

    // Update known position if player is overground
    if( !this.#focusedPlayer.tunnel ) {
      this.#lastOvergroundPlayerPosition= this.#focusedPlayer.position.copy()
    }

    // Move cat in direction of last known player position
    // Prevent overshooting of target by jumping to positions closer than the
    // movement vector
    const posVec= position.vector()
    const targetVec= this.#lastOvergroundPlayerPosition.vector()
    if( posVec.distanceToSquared( targetVec ) < this.#speed * this.#speed ) {
      newPosition= this.#lastOvergroundPlayerPosition.copy()
      
    } else {
      const movementVec= targetVec.sub( posVec ).unit().scale( this.#speed )
      newPosition.move( movementVec )
    }

    return newPosition
  }
}
