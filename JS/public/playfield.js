
import { Colors } from './colors.js'
import { Entity, Hitbox } from './entity.js'
import { PlayerMouse, Cat, MateMouse } from './actors.js'
import { Vector } from './util.js'

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

    this.drawHitboxIfEnabled()
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

  clampPositionToNearestSegment( x, y ) {
    const point= new Vector( x, y )

    // Iterate over all line segments of the tunnel path and 
    // calculate the closest point to each segment. Select
    // the closest of the closest points
    let closestDistanceSquared= Number.POSITIVE_INFINITY
    let closestClampedPoint= null
    for( let i= 0; i< this.vertices.length-1; i++ ) {
      // Make a vector for the segment and one for the point with a common base
      const segmentStart= new Vector( this.vertices[i] )
      const segmentEnd= new Vector( this.vertices[i+1] )

      const segment= segmentEnd.sub( segmentStart )
      const direction= point.sub( segmentStart )
    
      // Calculate the scalar projection and clamp it between 0...1
      // See: https://en.wikipedia.org/wiki/Scalar_projection
      const t= Math.max(0, Math.min(1, 
        direction.dot( segment ) / segment.lengthSquared()
      ))
      
      // Calculate the projected closest point and its distance
      const closestPointOnSegment= segmentStart.add( segment.scale( t ) )
      const closestDistanceToSegmentSquared= point.sub( closestPointOnSegment ).lengthSquared()

      // If the closest point has a lower distance, update the currently best one
      if( closestDistanceToSegmentSquared < closestDistanceSquared ) {
        closestDistanceSquared= closestDistanceToSegmentSquared
        closestClampedPoint= closestPointOnSegment
      }
    }

    return closestClampedPoint
  }
}

class Tunnel {
  #portals
  #geometry

  static fromJsonData( data ) {
    return new Tunnel(
      data.color,
      data.portals.map( portal => new TunnelPortal(portal.x, portal.y) ),
      new TunnelGeometry( data.geometry )
    )
  }
  
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

  hitboxOverlapsWithPortal( hitbox ) {
    return this.#portals.some( portal => portal.hitbox.overlapsWith( hitbox ) )
  }

  clampPositionToNearestSegment( x, y ) {
    return this.#geometry.clampPositionToNearestSegment( x, y )
  }
}

export class Playfield {
  #cats
  #mice
  #tunnels
  #player

  constructor() {
    this.#cats= new Map()
    this.#mice= new Map()
    this.#tunnels= []
    this.#player= null
  }

  get dimensions() {
    const renderer= Game.the().renderer
    return {x: 0, y: 15, w: renderer.width, h: renderer.height- 30}
  }

  async load() {
    const response= await fetch('/map')
    if( !response.ok ) {
      console.error( 'Server did not respond with map data' )
      return
    }

    const mapData= await response.json()

    if( !mapData || !Array.isArray( mapData.tunnels ) ) {
      console.error( 'Server sent invalid map data' )
      return
    }

    this.#tunnels= mapData.tunnels.map( data => Tunnel.fromJsonData( data ) )

    this.#player= new PlayerMouse( 100, 100 )
  }

  update( timeDelta ) {
    this.#player.update( timeDelta )
  }

  draw() {
    const renderer= Game.the().renderer
    renderer.pushState()
    
    const tunnelOfPlayer= this.#player.tunnel
    const {x,y,w,h}= this.dimensions
    renderer.fillColor= tunnelOfPlayer ? Colors.GrassWhileUnderground : Colors.Grass
    renderer.drawRectangle( x, y, w, h )

    // Draw tunnels
    this.#tunnels.forEach( tunnel => tunnel.draw( tunnelOfPlayer !== tunnel ) )


    // Draw mice
    this.#mice.forEach( mouse => {
      if( mouse.tunnel === tunnelOfPlayer ) {
        mouse.draw()
      }
    })
    this.#player.draw()

    // Draw cats
    if( !tunnelOfPlayer ) {
      this.#cats.forEach( cat => cat.draw() )
    }
    
    renderer.popState()
  }

  tunnelInReachOfPlayer() {
    return this.#tunnels.find( tunnel => tunnel.hitboxOverlapsWithPortal( this.#player.hitbox ) ) || null
  }

  tunnelByColor( color ) {
    return this.#tunnels.find( tunnel => tunnel.color === color ) || null
  }

  sendNetworkPackets() {
    const protocol= Game.the().connection.protocol
    const tunnelColor= Game.the().currentTunnel?.color
    const voteColor= null

    const playerHitbox= this.#player.hitbox
    protocol.sendPlayerUpdate( playerHitbox.x, playerHitbox.y, tunnelColor, voteColor )
  }

  receivedEntitiesMessage( mice, cats ) {
    // this.#cats= cats.map( cat => Cat.fromJsonData(cat) )

    mice.forEach( mouse => {
      if( mouse.id === Game.the().playerId ) {
        // Update player things: alive?
        return
      }

      // Get or create entity
      let entity= this.#mice.get( mouse.id )
      if( !entity ) {
        this.#mice.set( mouse.id, entity= new MateMouse(100, 100) )
      }

      entity.receivedMessage( mouse )
    })

    // There are less mice in the data packet than on the play field
    // -> find the stale entity and delete it
    if( mice.length !== this.#mice.size+ 1 ) {
      for( const id of this.#mice.keys() ) {
        if( !mice.some( mouse => mouse.id === id ) ) {
          this.#mice.delete( id )
        }
      }
    }
  }
}
