
import { Colors } from './colors.js'
import { Entity, Hitbox } from './entity.js'
import { PlayerMouse } from './actors.js'

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
