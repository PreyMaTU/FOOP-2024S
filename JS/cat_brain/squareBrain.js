
import { Brain } from "./brain.js"
import { RunningDirection } from "../public/actors.js"
import { Position } from "../serverEntity.js"

export class SquareBrain extends Brain {
  #state
  #initialPosition
  #width
  #height
  #speed

  constructor( width, height, speed ) {
    super()
    this.#state= null
    this.#initialPosition= null
    this.#width= width
    this.#height= height
    this.#speed= speed
  }

  init( position ) {
    this.#state= RunningDirection.Down
    this.#initialPosition= new Position( position )
  }

  update( position ) { 
    const newPosition= position.copy()
    newPosition.move( this.#state.vector.scale( this.#speed ) )

    switch( this.#state ) {
      case RunningDirection.Up:
        if( newPosition.y <= this.#initialPosition.y ) {
          this.#state= RunningDirection.Right
        }
        break

      case RunningDirection.Down:
        if( newPosition.y - this.#initialPosition.y >= this.#height ) {
          this.#state= RunningDirection.Left
        }
        break

      case RunningDirection.Left:
        if( newPosition.x <= this.#initialPosition.x ) {
          this.#state= RunningDirection.Up
        }
        break

      case RunningDirection.Right:
        if( newPosition.x - this.#initialPosition.x >= this.#width ) {
          this.#state= RunningDirection.Down
        }
        break
    }

    return newPosition
  }
}
