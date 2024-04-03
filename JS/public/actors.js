import { Entity, Hitbox } from './entity.js'

const RunningDirection= {
  Up: { name: 'up' },
  Down: { name: 'down' },
  Left: { name: 'left' },
  Right: { name: 'right' }
}


export class Actor extends Entity {
  #hitbox
  #standingSprite
  #runningSprite
  #runningDirection

  constructor( posX, posY, width, height, standingSpriteName, runningSpriteName ) {
    super()
    this.#hitbox = new Hitbox(posX, posY, width, height )
    this.#standingSprite= Game.the().spriteSheet.get( standingSpriteName )
    this.#runningSprite= Game.the().spriteSheet.get( runningSpriteName )
    this.#runningDirection= null
  }

  get hitbox() { return this.#hitbox }
  get standingSprite() { return this.#standingSprite }
  get runningSprite() { return this.#standingSprite }
  get runningDirection() { return this.#runningDirection }

  set runningDirection( direction ) { this.#runningDirection= direction }

  draw() {
    const sprite= this.#runningDirection ? this.#runningSprite : this.#standingSprite
    if( this.#runningDirection === RunningDirection.Right || this.#runningDirection === RunningDirection.Down ) {
      Game.the().renderer.drawImageMirrored( sprite, this.#hitbox.x, this.#hitbox.y )

    } else {
      Game.the().renderer.drawImage( sprite, this.#hitbox.x, this.#hitbox.y )
    }
  }
}


export class Mouse extends Actor {
  constructor( posX, posY ) {
    super( posX, posY, 13, 13, 'mouseStanding', 'mouseRunning' );
  }
}


export class PlayerMouse extends Mouse {
  update( timeDelta ) {
    const movement= 30* timeDelta / 1000
    const keyboard= Game.the().keyboard
    if( keyboard.keyIsDown('w') ) {
      this.hitbox.move( 0, -movement )
      this.runningDirection= RunningDirection.Up

    } else if( keyboard.keyIsDown('a') ) {
      this.hitbox.move( -movement, 0 )
      this.runningDirection= RunningDirection.Left

    } else if( keyboard.keyIsDown('s') ) {
      this.hitbox.move( 0, movement )
      this.runningDirection= RunningDirection.Down

    } else if( keyboard.keyIsDown('d') ) {
      this.hitbox.move( movement, 0 )
      this.runningDirection= RunningDirection.Right

    } else {
      this.runningDirection= null
    }
  }
}
