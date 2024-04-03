import { abstractMethod } from './util.js'
import { Colors } from './colors.js'

class State {
  frame() { abstractMethod() }

  is( kind ) {
    return this.constructor === kind
  }

  isPlayable() { abstractMethod() }
}

class MenuState extends State {
  #previousState

  constructor() {
    super()
    this.#previousState= Game.the().state
  }

  drawMenuBox( width, height, title, content= [] ) {
    const renderer= Game.the().renderer
    renderer.pushState()

    // Draw Background Overlay
    renderer.fillColor= Colors.MenuOverlay
    renderer.noStroke()
    renderer.enableFilter( false )
    renderer.drawRectangle(0, 15, renderer.width, renderer.height - 30 )
    renderer.enableFilter()

    // Draw Menu Box with shadow
    const x= renderer.width/2 - width/2
    const y= renderer.height/2 - height/2
    renderer.fillColor= Colors.MenuShadow
    renderer.drawRectangle( x+2, y+2, width, height )
    renderer.fillColor= Colors.Black
    renderer.drawRectangle( x, y, width, height )

    // Draw Menu Title
    renderer.fillColor = Colors.White
    renderer.fontSize = 16
    renderer.textAlign = 'center'
    renderer.drawText( title, renderer.width / 2, y + 5)
    
    // Draw Menu Elements
    renderer.fontSize= 10
    content.forEach( ({command, description}, idx) => {
      const posY= y + 30 + 20 * idx

      renderer.textAlign= 'left'
      renderer.drawText( command, x + 8, posY )

      renderer.textAlign= 'right'
      renderer.drawText( description, x + width - 8, posY )
    })

    renderer.popState()
  }

  restorePreviousState() {
    Game.the().changeState( this.#previousState )
  }

  isPlayable() { return false }
}

class PlayableState extends State {
  isPlayable() { return true }
}



export class OutsideTunnel extends PlayableState {
  frame() {
    const game = Game.the()
    game.playfield.draw()

    if( game.keyboard.keyIsDown('p') ) {
      game.changeState( new PauseMenu() )

    } else if( game.keyboard.keyWasPressed('Escape') ) {
      game.changeState( new HelpMenu() )
    }
  }
}

export class InsideTunnel extends PlayableState {

}

export class VoteMenu extends MenuState {

}

export class HelpMenu extends MenuState {
  frame() {
    const game= Game.the()
    game.playfield.draw()

    this.drawMenuBox(200, 130, 'Controls', [
      { command: 'W A S D', description: 'Movement' },
      { command: 'Space', description: 'Enter/Exit Tunnel' },
      { command: 'Esc', description: 'Open/Close Help' },
      { command: 'Tab', description: 'Open/Close Vote' },
      { command: 'P', description: 'Pause' }
    ])


    if( game.keyboard.keyWasPressed( 'Escape' ) ) {
      this.restorePreviousState()
    }
  }
}

export class PauseMenu extends MenuState {
  frame() {
    const game= Game.the()
    game.playfield.draw()

    this.drawMenuBox(100, 70, 'Pause', [
      { command: 'C', description: 'Continue' },
      { command: 'Q', description: 'Quit' }
    ])


    if( game.keyboard.keyIsDown( 'c' ) ) {
      this.restorePreviousState()
    }
  }
}
