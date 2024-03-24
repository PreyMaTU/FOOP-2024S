
import { Renderer } from './renderer.js';

class Game {
  static create() {
    const gameCanvas= document.getElementById('game')
    gameCanvas.width= 320
    gameCanvas.height= 180

    const renderer= new Renderer( gameCanvas )
    return new Game( renderer )
  }

  constructor( renderer ) {
    this.renderer= renderer
  }

  loop() {

    this.renderer.background( '#aaa' )

    this.renderer.strokeColor= 'blue'
    this.renderer.fillColor= 'red'
    this.renderer.drawCircle( this.renderer.width/2, this.renderer.height/2, 10 )

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


