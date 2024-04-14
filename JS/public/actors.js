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
      const drawingOffset= Math.max( 0, sprite.width - this.#hitbox.w )
      Game.the().renderer.drawImageMirrored( sprite, this.#hitbox.x- drawingOffset, this.#hitbox.y )

    } else {
      Game.the().renderer.drawImage( sprite, this.#hitbox.x, this.#hitbox.y )
    }

    this.drawHitboxIfEnabled()
  }
}


export class Mouse extends Actor {
  constructor( posX, posY ) {
    super( posX, posY, 13, 13, 'mouseStanding', 'mouseRunning' );
  }

  // TODO: Implement update
}


export class PlayerMouse extends Mouse {
  update( timeDelta ) {
    if( !Game.the().state.isPlayable() ) {
      this.runningDirection= null
      return
    }

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

    } else if( keyboard.keyWasPressed(' ') ) { // Space Key
      const currentTunnel = Game.the().playfield.tunnelInReachOfPlayer()
      if( currentTunnel ) {
        Game.the().state.changeToOpposite( currentTunnel )        
      }

    } else {
      this.runningDirection= null
    }

    // When we are moving inside a tunnel, we need to clamp the position
    // to the tunnel walls
    const currentTunnel= Game.the().currentTunnel
    if( currentTunnel && this.runningDirection ) {
      const {x, y}= currentTunnel.clampPositionToNearestSegment( this.hitbox.centerX, this.hitbox.centerY )
      this.hitbox.centerX= x;
      this.hitbox.centerY= y;
    }

    const fieldDimensions= Game.the().playfield.dimensions
    this.hitbox.clampPosition( fieldDimensions.x, fieldDimensions.y, fieldDimensions.x+ fieldDimensions.w, fieldDimensions.y+ fieldDimensions.h )
  }
}

export class Cat extends Actor {
  constructor( posX, posY ) {
    super( posX, posY, 22, 22, 'catSitting', 'catRunning' )
  }

  // TODO: implement update
}
