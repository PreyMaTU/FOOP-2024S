
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
    let newPosition= position

    switch( this.#state ) {
      case RunningDirection.Up:
        newPosition= new Position( position.x, position.y - this.#speed )
        if( newPosition.y <= this.#initialPosition.y ) {
          this.#state= RunningDirection.Right
        }
        break

      case RunningDirection.Down:
        newPosition = new Position(position.x, position.y + this.#speed )
        if( newPosition.y - this.#initialPosition.y >= this.#height ) {
          this.#state= RunningDirection.Left
        }
        break

      case RunningDirection.Left:
        newPosition = new Position(position.x - this.#speed, position.y )
        if( newPosition.x <= this.#initialPosition.x ) {
          this.#state= RunningDirection.Up
        }
        break

      case RunningDirection.Right:
        newPosition = new Position(position.x + this.#speed, position.y )
        if( newPosition.x - this.#initialPosition.x >= this.#width ) {
          this.#state= RunningDirection.Down
        }
        break
    }

    return newPosition
  }
}
