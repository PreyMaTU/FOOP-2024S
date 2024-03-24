
import { Colors } from './colors.js'

function abstractMethod() {
  throw Error('Abstract Method');
}

class Hitbox {
  constructor(x, y, w, h) {
    this.x= x
    this.y= y
    this.w= w
    this.h= h
  }

  /** @param {Hitbox} other */
  overlapsWith( other ) {
    // Hitbox has no area -> no overlap
    if( !this.w || !this.h || !other.w || !other.h ) {
      return false
    }

    // Hitboxes to the left of each other -> no overlap
    if(this.x > other.x+ other.w || other.x > this.x+ this.w) {
      return false
    }

    // Hitboxes are on top of each other -> no overlap
    if (this.y + this.h > other.y || other.y + other.h > this.y) {
      return false
    }

    return true
  }

  move( x, y ) {
    this.x+= x
    this.y+= y
  }

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

class Entity {
  draw() { abstractMethod() }
  update() {}
  get hitbox() { abstractMethod() }
}

class TunnelPortal extends Entity {
  #sprite
  #hitbox

  constructor( posX, posY ) {
    super()
    this.#hitbox= new Hitbox( posX, posY, 20, 20 )
    this.#sprite= Game.the().spriteSheet.get('tunnelPortal')
  }

  draw( color ) {
    const renderer= Game.the().renderer
    renderer.drawImage( this.#sprite, this.#hitbox.x, this.#hitbox.y )
    renderer.fillColor= color
    renderer.noStroke()
    renderer.drawCircle( this.#hitbox.x+ this.#hitbox.w/2, this.#hitbox.y+ this.#hitbox.h/2, 3 )
  }

  get hitbox() {
    return this.#hitbox
  }
}

class TunnelGeometry {
  constructor( vertices ) {
    this.vertices= vertices
  }

  draw( highlighted= false )  {
    const renderer= Game.the().renderer
    renderer.strokeColor= highlighted ? Colors.HighlightedTunnel : Colors.Tunnel
    renderer.strokeWeight= 14
    renderer.noFill()
    renderer.drawPath( this.vertices )
  }
}

class Tunnel {
  #portals
  #geometry

  constructor( color, portals, geometry) {
    this.color= color
    this.#portals= portals
    this.#geometry= geometry
  }

  draw( onlyPortals ) {
    const renderer= Game.the().renderer
    renderer.pushState()

    if( !onlyPortals ) {
      this.#geometry.draw()
    }

    this.#portals.forEach( portal => {
      portal.draw( this.color )
      // portal.hitbox.draw()
    })

    renderer.popState()
  }
}

const RunningDirection= {
  Up: {},
  Down: {},
  Left: {},
  Right: {}
}

class PlayerMouse extends Entity {
  #hitbox
  #standingSprite
  #runningSprite
  #runningDirection

  constructor( posX, posY ) {
    super()
    this.#hitbox= new Hitbox( posX, posY, 13, 13 )
    this.#standingSprite= Game.the().spriteSheet.get('mouseStanding')
    this.#runningSprite= Game.the().spriteSheet.get('mouseRunning')
    this.#runningDirection= null
  }

  update( timeDelta ) {
    const movement= 30* timeDelta / 1000
    const keyboard= Game.the().keyboard
    if( keyboard.keyIsDown('w') ) {
      this.#hitbox.move( 0, -movement )
      this.#runningDirection= RunningDirection.Up

    } else if( keyboard.keyIsDown('a') ) {
      this.#hitbox.move( -movement, 0 )
      this.#runningDirection= RunningDirection.Left

    } else if( keyboard.keyIsDown('s') ) {
      this.#hitbox.move( 0, movement )
      this.#runningDirection= RunningDirection.Down

    } else if( keyboard.keyIsDown('d') ) {
      this.#hitbox.move( movement, 0 )
      this.#runningDirection= RunningDirection.Right

    } else {
      this.#runningDirection= null
    }
  }

  draw() {
    const sprite= this.#runningDirection ? this.#runningSprite : this.#standingSprite
    Game.the().renderer.drawImage( sprite, this.#hitbox.x, this.#hitbox.y )
  }
}

export class Playfield {
  #cats
  #mice
  #tunnels
  #player

  constructor() {
    this.#cats= []
    this.#mice= []
    this.#tunnels= []
    this.#player= null
  }

  async load() {
    // TODO: Make an API call to the server to load the map data
    this.#tunnels= [ new Tunnel( 'red', [new TunnelPortal(60, 60), new TunnelPortal(100, 100)], new TunnelGeometry([[70, 70], [70, 110], [110, 110] ]) ) ]

    this.#player= new PlayerMouse( 100, 100 )
  }

  update( timeDelta ) {
    this.#player.update( timeDelta )
  }

  draw() {
    const renderer= Game.the().renderer
    renderer.pushState()

    renderer.fillColor= Colors.Grass
    renderer.drawRectangle(0, 15, renderer.width, renderer.height- 30 )

    // Draw tunnels
    this.#tunnels.forEach( tunnel => tunnel.draw() )


    // Draw mice
    this.#player.draw()

    // Draw cats
    
    renderer.popState()
  }
}
