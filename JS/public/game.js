
import { Renderer, SpriteSheet } from './renderer.js'
import { Colors } from './colors.js'
import { Playfield } from './playfield.js'
import { Keyboard } from './keyboard.js'

class Game {
  static instance= null

  static async create() {
    const gameCanvas= document.getElementById('game')
    gameCanvas.width= 320
    gameCanvas.height= 180

    const spriteSheet= new SpriteSheet( '/sprites.png' )
    await spriteSheet.load()

    await spriteSheet.sprites({
      tunnelPortal: {x: 0, y: 0, w: 20, h: 20 },
      mouseStanding: {x: 21, y: 7, w: 16, h: 13},
      mouseRunning: { x: 40, y: 12, w: 26, h: 8}
    })

    const renderer= new Renderer( gameCanvas )
    const game= Game.instance= new Game( renderer, spriteSheet )

    await game.playfield.load()

    return game
  }

  static the() {
    return Game.instance;
  }

  /** @param {Renderer} renderer */
  constructor( renderer, spriteSheet ) {
    this.renderer= renderer
    this.spriteSheet= spriteSheet
    this.playfield= new Playfield()
    this.keyboard= new Keyboard()
    this.lastTimestamp= 0
  }

  drawTopBar() {
    this.renderer.pushState()
    this.renderer.noStroke()
    this.renderer.fillColor= Colors.Black

    this.renderer.drawRectangle( 0, 0, this.renderer.width, 15 );

    this.renderer.popState()
  }

  drawBottomBar() {
    this.renderer.pushState()
    this.renderer.noStroke()
    this.renderer.fillColor= Colors.Black

    this.renderer.drawRectangle( 0, this.renderer.height-15, this.renderer.width, 15 );

    this.renderer.popState()
  }

  loop( timeStamp ) {
    const timeDelta= this.lastTimestamp > 0 ? timeStamp- this.lastTimestamp : 0
    this.lastTimestamp= timeStamp
    this.playfield.update( timeDelta )

    
    // Clear background with grey color to spot under-drawing
    this.renderer.drawBackground( '#aaa' )

    this.playfield.draw()

    this.drawTopBar()
    this.drawBottomBar()
  }

  run() {
    const callback= timeStamp => {
      this.loop( timeStamp )

      // Tell browser which function to call for the next frame
      window.requestAnimationFrame( callback )
    }

    // Start the draw loop
    callback()
  }
}

window.Game= Game


async function main() {
  await Game.create()
  Game.the().run()
}

document.addEventListener('DOMContentLoaded', main)


