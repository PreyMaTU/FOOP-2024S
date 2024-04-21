
import { Colors } from './colors.js'
import { Entity, Hitbox } from './entity.js'
import { PlayerMouse, Cat, MateMouse } from './actors.js'
import { Vector } from './util.js'
import * as States from './state.js'

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

class EntityMap {
  #map
  #producer

  constructor( producer ) {
    this.#map= new Map()
    this.#producer= producer
  }

  forEach( fn ) {
    this.#map.forEach( fn )
  }

  get size() {
    return this.#map.size
  }

  updateFromArray( array, updateFn, ignoreList= [] ) {
    array.forEach( item => {
      if( ignoreList.indexOf(item.id) >= 0 ) {
        updateFn( item, null )
        return
      }

      // Get or create entity
      let entity= this.#map.get( item.id )
      if( !entity ) {
        this.#map.set( item.id, entity= this.#producer() )
      }

      updateFn( item, entity )
    })

    // There are less items in the data packet than on the play field
    // -> find the stale entity and delete it
    if( array.length !== this.#map.size+ ignoreList.length ) {
      for( const id of this.#map.keys() ) {
        if( !array.some( item => item.id === id ) ) {
          this.#map.delete( id )
        }
      }
    }
  }
}

export class Playfield {
  #cats
  #mice
  #tunnels
  #player

  constructor() {
    this.#cats= new EntityMap( () => new Cat( -1000, -1000 ) )
    this.#mice= new EntityMap( () => new MateMouse( -1000, -1000 ) )
    this.#tunnels= []
    this.#player= null
  }

  get dimensions() {
    const renderer= Game.the().renderer
    return {x: 0, y: 15, w: renderer.width, h: renderer.height- 30}
  }

  get tunnels() {
    return this.#tunnels
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
    this.#mice.forEach( mouse => mouse.update( timeDelta ) )
    this.#cats.forEach( cat => cat.update( timeDelta ) )
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
      if( mouse.tunnel === tunnelOfPlayer && mouse.alive ) {
        mouse.draw()
      }
    })
    this.#player.draw()

    // Draw cats
    if( !tunnelOfPlayer ) {
      this.#cats.forEach( cat => { cat.draw()} )
    }
    
    renderer.popState()
  }

  tunnelInReachOfPlayer() {
    return this.#tunnels.find( tunnel => tunnel.hitboxOverlapsWithPortal( this.#player.hitbox ) ) || null
  }

  tunnelByColor( color ) {
    return this.#tunnels.find( tunnel => tunnel.color === color ) || null
  }

  countMice() {
    const total= this.#mice.size + 1
    let alive= Game.the().state.isAlive() ? 1 : 0

    this.#mice.forEach( mouse => alive+= mouse.alive ? 1 : 0 )

    return {alive, total}
  }

  sendNetworkPackets() {
    const game= Game.the()
    const protocol= game.connection.protocol
    const tunnelColor= game.currentTunnel?.color
    const voteColor= game.currentVote?.color

    const playerHitbox= this.#player.hitbox
    protocol.sendPlayerUpdate( playerHitbox.x, playerHitbox.y, tunnelColor, voteColor )
  }

  receivedEntitiesMessage( mice, cats ) {
    // Update the mice from the message
    this.#mice.updateFromArray( mice, (item, entity) => {
      // Update the player entity
      if( !entity ) {
        if( !item.alive ) {
          Game.the().changeState( new States.GameOver() )
        }
        return
      }

      entity.receivedMessage( item )
    }, [Game.the().playerId])

    // Update the cats from the message
    this.#cats.updateFromArray( cats, (item, entity) => {
      entity.receivedMessage( item )
    })
  }
}
