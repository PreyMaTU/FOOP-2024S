
import { Renderer, SpriteSheet } from './renderer.js'
import { Colors } from './colors.js'

let mouse= null

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
      mouseStanding: {x: 21, y: 7, w: 16, h: 13}
    })

    mouse= spriteSheet.get('mouseStanding')

    const renderer= new Renderer( gameCanvas )
    Game.instance= new Game( renderer, spriteSheet )

    await Game.instance.playfield.load()

    return Game.instance
  }

  static the() {
    return Game.instance;
  }

  /** @param {Renderer} renderer */
  constructor( renderer, spriteSheet ) {
    this.renderer= renderer
    this.spriteSheet= spriteSheet
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

  loop() {

    this.renderer.drawBackground( '#aaa' )


    this.drawTopBar()
    this.drawBottomBar()

    this.renderer.drawImage( mouse, 40, 40 )
  }

  run() {
    const callback= () => {
      this.loop()

      // Tell browser which function to call for the next frame
      window.requestAnimationFrame( callback )
    }

    // Initial start of the draw loop
    callback()
  }
}

window.Game= Game


async function main() {
  await Game.create()
  Game.the().run()
}

document.addEventListener('DOMContentLoaded', main)


