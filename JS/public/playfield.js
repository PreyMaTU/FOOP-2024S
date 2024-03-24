
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

  draw( renderer ) {
    renderer.pushState()
    renderer.strokeWeight= 2
    renderer.strokeColor= 'red'
    renderer.noFill()

    renderer.drawRectangle( this.x, this.y, this.w, this.h )

    renderer.popState()
  }
}

class Entity {
  draw( renderer ) { abstractMethod() }
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

  draw( color, renderer ) {
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

  draw( renderer, highlighted= false )  {
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

  draw( renderer, onlyPortals ) {
    renderer.pushState()

    if( !onlyPortals ) {
      this.#geometry.draw( renderer )
    }

    this.#portals.forEach( portal => {
      portal.draw( this.color, renderer )
      // portal.hitbox.draw()
    })

    renderer.popState()
  }
}


export class Playfield {
  #cats
  #mice
  #tunnels

  constructor() {
    this.#cats= []
    this.#mice= []
    this.#tunnels= []
  }

  async load() {
    this.#tunnels= [ new Tunnel( 'red', [new TunnelPortal(60, 60), new TunnelPortal(100, 100)], new TunnelGeometry([[70, 70], [70, 110], [110, 110] ]) ) ]
  }

  draw( renderer ) {
    renderer.pushState()

    renderer.fillColor= Colors.Grass
    renderer.drawRectangle(0, 15, renderer.width, renderer.height- 30 )

    // Draw tunnels
    this.#tunnels.forEach( tunnel => tunnel.draw(renderer) )


    // Draw mice

    // Draw cats
    
    renderer.popState()
  }
}
