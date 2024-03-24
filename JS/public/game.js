
import { Renderer } from './renderer.js'
import { Colors } from './colors.js'

class Game {
  static create() {
    const gameCanvas= document.getElementById('game')
    gameCanvas.width= 320
    gameCanvas.height= 180

    const renderer= new Renderer( gameCanvas )
    return new Game( renderer )
  }

  /** @param {Renderer} renderer */
  constructor( renderer ) {
    this.renderer= renderer
  }

  drawTopBar() {
    this.renderer.pushState()
    this.renderer.fillColor= Colors.Black

    this.renderer.drawRectangle( 0, 0, this.renderer.width, 15 );

    this.renderer.popState()
  }

  drawBottomBar() {
    this.renderer.pushState()
    this.renderer.fillColor= Colors.Black

    this.renderer.drawRectangle( 0, this.renderer.height-15, this.renderer.width, 15 );

    this.renderer.popState()
  }

  loop() {

    this.renderer.drawBackground( '#aaa' )
    this.renderer.strokeWeight= 3 

    this.renderer.strokeColor= 'blue'
    this.renderer.fillColor= 'red'
    this.renderer.drawCircle( 50, 30, 10 )
    this.renderer.drawCircle( 50, 60, 10 )
    this.renderer.drawCircle( 50, 90, 10 )
    this.renderer.drawCircle( 50, 120, 10 )

    this.renderer.drawRectangle( 100, 100, 60, 60)

    this.drawTopBar()
    this.drawBottomBar()
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


function main() {
  const game = Game.create()
  game.run()
}

document.addEventListener('DOMContentLoaded', main)


