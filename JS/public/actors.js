import { Entity, Hitbox, LinearSteerer } from './entity.js'
import { Vector } from './util.js'

/**
 * Enum class for 2D euclidean running directions. Has convenience
 * methods to get the name, a representing directional vector and
 * deserialization from strings.
 */
export class RunningDirection {
  #name
  #vector

  static Up= new RunningDirection( 'up', new Vector( 0, -1 ) )
  static Down= new RunningDirection( 'down', new Vector( 0, 1 ) )
  static Left= new RunningDirection( 'left', new Vector( -1, 0 ) )
  static Right= new RunningDirection( 'right', new Vector( 1, 0 ) )

  constructor( name, vector ) {
    this.#name= name
    this.#vector= vector
    Object.freeze( this )
  }

  get name() { return this.#name }
  get vector() { return this.#vector }

  // Deserialize a string to get a running direction object
  static fromName( name ) {
    for( const key in RunningDirection ) {
      const value= RunningDirection[key]
      if( key.toLowerCase() === name && value instanceof RunningDirection ) {
        return value
      }
    }

    return null
  }
}


/**
 * Actors are entities that move around the player field and can interact with the environment,
 * as well as with each other. The have a position and extent, and show different sprites
 * depending on whether they are currently moving.
 */
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
    // Only draw the running sprite of the actor if it is moving, else the standing sprite
    const sprite= this.#runningDirection ? this.#runningSprite : this.#standingSprite
    
    // Draw the mirrored sprite for downwards or rightwards movements
    if( this.#runningDirection === RunningDirection.Right || this.#runningDirection === RunningDirection.Down ) {
      const drawingOffset= Math.max( 0, sprite.width - this.#hitbox.w )
      Game.the().renderer.drawImageMirrored( sprite, this.#hitbox.x- drawingOffset, this.#hitbox.y )

    } else {
      Game.the().renderer.drawImage( sprite, this.#hitbox.x, this.#hitbox.y )
    }

    this.drawHitboxIfEnabled()
  }
}

/**
 * Abstract base class for mouse actors. Only sets the visual appearance by specifying
 * the sprites and hitbox.
 */
class Mouse extends Actor {
  constructor( posX, posY ) {
    super( posX, posY, 13, 13, 'mouseStanding', 'mouseRunning' );
    this.runningDirection= null
    this.tunnel= null
  }
}

/**
 * Mouse controlled by a different player over the network. Uses a linear steerer
 * to smooth out the stuttering between the updates.
 */
export class MateMouse extends Mouse {
  constructor( posX, posY ) {
    super( posX, posY )
    this.steerer= new LinearSteerer( 30/1000 )
    this.alive= true
  }

  // Update state of the mouse according to information
  // received from the server
  receivedMessage( mouse ) {
    this.steerer.setTarget( this.hitbox, mouse.x, mouse.y )
    this.runningDirection= RunningDirection.fromName( mouse.runningDirection )
    this.tunnel= Game.the().playfield.tunnelByColor( mouse.tunnel )
    this.alive= mouse.alive
  }

  // Update the position via the steerer
  update( timeDelta ) {
    this.steerer.updateHitbox( this.hitbox, timeDelta )
  }
}


/**
 * Character controlled by the player of the game. Movement is controlled
 * via the keyboard. Can enter tunnels be pressing space bar. When inside
 * a tunnel the movement is restricted to the tunnel's walls.
 */
export class PlayerMouse extends Mouse {
  update( timeDelta ) {
    
    // Check if the game is still ongoing
    if( !Game.the().state.isPlayable() ) {
      this.runningDirection= null
      return
    }

    // Move the player mouse according to the keys pressed
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
      // Toggle the current tunnel if the player stands on a tunnel portal
      const currentTunnel = Game.the().playfield.tunnelInReachOfPlayer()
      if( currentTunnel ) {
        this.toggleTunnel( currentTunnel )
      }

    } else {
      this.runningDirection= null
    }

    // When we are moving inside a tunnel, we need to clamp the position
    // to the tunnel walls
    if( this.tunnel && this.runningDirection ) {
      const {x, y}= this.tunnel.clampPositionToNearestSegment( this.hitbox.centerX, this.hitbox.centerY )
      this.hitbox.centerX= x;
      this.hitbox.centerY= y;
    }

    const fieldDimensions= Game.the().playfield.dimensions
    this.hitbox.clampPosition( fieldDimensions.x, fieldDimensions.y, fieldDimensions.x+ fieldDimensions.w, fieldDimensions.y+ fieldDimensions.h )
  }

  // Toggle mouse position between being inside or outside of a tunnel
  toggleTunnel( tunnel ) {
    Game.the().state.changeToOpposite( tunnel )
    this.tunnel= Game.the().currentTunnel
  }
}

/**
 * Enemy cat NPC controlled by the server and updated via the network. It uses
 * a linear steerer to smooth out the stuttering between updates.
 */
export class Cat extends Actor {
  constructor( posX, posY ) {
    super( posX, posY, 22, 22, 'catSitting', 'catRunning' )
    this.steerer= new LinearSteerer( 60/1000 )
  }

  // Update state of the cat according to information
  // received from the server
  receivedMessage( cat ) {
    this.steerer.setTarget( this.hitbox, cat.x, cat.y )
    this.runningDirection= RunningDirection.fromName( cat.runningDirection )
  }

  // Update the position via the steerer
  update( timeDelta ) {
    this.steerer.updateHitbox( this.hitbox, timeDelta )
  }
}
