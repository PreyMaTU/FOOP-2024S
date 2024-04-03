
import { Renderer, SpriteSheet } from './renderer.js'
import { Colors } from './colors.js'
import { Playfield } from './playfield.js'
import { Keyboard } from './keyboard.js'
import * as State from './state.js'

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
      mouseRunning: { x: 40, y: 12, w: 26, h: 8},
      catSitting: {x: 0, y: 21, w: 22, h: 22},
      catRunning: {x: 31, y: 21, w: 28, h: 22}
    })

    const font= new FontFace("pixelFont", "url(/fonts/slkscr.ttf)");
    await font.load()
    document.fonts.add(font)

    const renderer= new Renderer( gameCanvas, font.family )
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
    this.state= new State.OutsideTunnel()
    this.lastTimestamp= 0
  }

  changeState( newState ) {
    this.state= newState
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

    this.state.frame()

    this.drawTopBar()
    this.drawBottomBar()
    this.keyboard.frame()
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


