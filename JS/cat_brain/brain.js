import { abstractMethod } from "../public/util.js"
import { RunningDirection } from "../public/actors.js"
import { Position } from "../serverEntity.js"


export class Brain {
  init() { abstractMethod() }
  update() { abstractMethod() }
}

export class SquareBrain extends Brain {
  #state
  #initialPosition

  constructor() {
    super()
    this.#state= null
    this.#initialPosition= null
  }

  init( position ) {
    this.#state= RunningDirection.Down
    this.#initialPosition= new Position( position )
  }

  update( position ) { 
    const movement= 3
    let newPosition= position

    switch( this.#state ) {
      case RunningDirection.Up:
        newPosition= new Position( position.x, position.y - movement )
        if( newPosition.y <= this.#initialPosition.y ) {
          this.#state= RunningDirection.Right
        }
        break

      case RunningDirection.Down:
        newPosition= new Position( position.x, position.y + movement )
        if( newPosition.y - this.#initialPosition.y >= 36 ) {
          this.#state= RunningDirection.Left
        }
        break

      case RunningDirection.Left:
        newPosition= new Position( position.x - movement, position.y )
        if( newPosition.x <= this.#initialPosition.x ) {
          this.#state= RunningDirection.Up
        }
        break

      case RunningDirection.Right:
        newPosition= new Position( position.x + movement, position.y )
        if( newPosition.x - this.#initialPosition.x >= 36 ) {
          this.#state= RunningDirection.Down
        }
        break
    }

    return newPosition
  }
}
