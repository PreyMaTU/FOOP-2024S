
import { Colors } from './colors.js'

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
  }

  draw( renderer ) {
    renderer.pushState()

    renderer.fillColor= Colors.Grass
    renderer.drawRectangle(0, 15, renderer.width, renderer.height- 30 )

    // Draw tunnels
    // Draw mice

    // Draw cats
    
    renderer.popState()
  }
}
