
import { abstractMethod } from './util.js'

export class Hitbox {
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
    if(this.x > other.x + other.w || other.x > this.x + this.w) {
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

export class Entity {
  draw() { abstractMethod() }
  update() {}
  get hitbox() { abstractMethod() }
}