import { abstractMethod } from './util.js'
import { Colors } from './colors.js'

/**
 * Abstract base class for game states. A stat is initialized once
 * when entered and then called every frame to control the game's
 * behavior. It offers additional query methods to let other components
 * know how to behave when the state is active.
 */
class State {
  frame() { abstractMethod() }

  is( kind ) {
    return this.constructor === kind
  }

  init() {}

  isPlayable() { abstractMethod() }
  isAlive() { return true }
}


/**
 * Base state for all states that act as on screen menus. Stores
 * the previous active state and restores it when the menu closes.
 * Has convenience methods used by other menu states for rendering.
 */
class MenuState extends State {
  #previousState

  constructor() {
    super()
    this.#previousState= Game.the().state
  }

  // Draw a menu box with content over the game map.
  // The content is drawn as a two column table with a command
  // and description.
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

  // Restore the previous state of the game, this closes
  // the menu
  restorePreviousState() {
    Game.the().changeState( this.#previousState )
  }

  isPlayable() { return false }
}


/**
 * Abstract base class for playable states where the
 * player can interact with the mouse character.
 */
class PlayableState extends State {
  isPlayable() { return true }

  changeToOpposite() { abstractMethod() }
}


/**
 * The player mouse is overground (no tunnel). Can open pause
 * menu or end the game.
 */
export class OutsideTunnel extends PlayableState {
  frame() {
    const game = Game.the()
    game.playfield.draw()

    // Handle menu key events
    if( game.keyboard.keyIsDown('p') ) {
      game.changeState( new PauseMenu() )

    } else if( game.keyboard.keyWasPressed('Escape') ) {
      game.changeState( new HelpMenu() )
    }
  }

  changeToOpposite( currentTunnel ) {
    if( currentTunnel ) {
      Game.the().currentTunnel= currentTunnel
      Game.the().changeState( new InsideTunnel() )
    }
  }
}

/**
 * The player mouse is underground (inside tunnel). Can open pause
 * menu, end the game or cast a vote for a tunnel color.
 */
export class InsideTunnel extends PlayableState {
  frame() {
    const game = Game.the()
    game.playfield.draw()

    // Handle menu key events
    if( game.keyboard.keyIsDown('p') ) {
      game.changeState( new PauseMenu() )

    } else if( game.keyboard.keyWasPressed('Escape') ) {
      game.changeState( new HelpMenu() )
      
    } else if( game.keyboard.keyWasPressed('v') ) {
      game.changeState( new VoteMenu() )
    }
  }

  changeToOpposite() {
    Game.the().currentTunnel= null
    Game.the().changeState( new OutsideTunnel() )
  }
}

/**
 * This menu allows casting a vote for a specific tunnel color.
 * All possible colors are displayed in a circle, by pressing
 * the number key associated with the color, the color is selected
 * and highlighted.
 */
export class VoteMenu extends MenuState {
  frame() {
    const game = Game.the()
    game.playfield.draw()

    this.drawMenuBox(100, 100, 'Vote', [])

    const renderer= game.renderer
    renderer.pushState()

    const tunnels= Game.the().playfield.tunnels
    const angleStep= 2* Math.PI / tunnels.length

    const radius= 20

    // Draw a disk with a number inside for each tunnel color
    let angle= 0
    let idx = 1
    for( const tunnel of tunnels ) {
      const x= renderer.width/2+ Math.sin(angle)* radius
      const y= renderer.height/2- Math.cos(angle)* radius+ 15

      renderer.noStroke()
      renderer.fillColor= tunnel.color
      renderer.drawCircle( x, y, 10 )

      renderer.textAlign= 'center'
      renderer.fillColor= Colors.White
      renderer.drawText(''+ idx, x, y- 4)

      // Draw highlighting circle around voted tunnel
      if( game.currentVote === tunnel ) {
        renderer.noFill()

        renderer.strokeColor= Colors.White
        renderer.strokeWeight= 2
        renderer.drawCircle( x, y, 13 )
      }

      angle+= angleStep
      idx++
    }

    // Update the vote when key was pressed with index number
    idx= 1
    for( const tunnel of tunnels ) {
      if( game.keyboard.keyWasPressed( ''+ idx ) ) {
        game.currentVote= tunnel
      }
      idx++
    }

    renderer.popState()

    // Close the menu
    if( game.keyboard.keyWasPressed('v') ) {
      this.restorePreviousState()
    }
  }
}

/**
 * Display a help message with the available controls.
 */
export class HelpMenu extends MenuState {
  frame() {
    const game= Game.the()
    game.playfield.draw()

    this.drawMenuBox(200, 130, 'Controls', [
      { command: 'W A S D', description: 'Movement' },
      { command: 'Space', description: 'Enter/Exit Tunnel' },
      { command: 'Esc', description: 'Open/Close Help' },
      { command: 'V', description: 'Open/Close Vote' },
      { command: 'P', description: 'Pause' }
    ])

    // Close the menu
    if( game.keyboard.keyWasPressed( 'Escape' ) ) {
      this.restorePreviousState()
    }
  }
}

/**
 * Display a menu where the player can quit the game.
 */
export class PauseMenu extends MenuState {
  frame() {
    const game= Game.the()
    game.playfield.draw()

    this.drawMenuBox(100, 70, 'Pause', [
      { command: 'C', description: 'Continue' },
      { command: 'Q', description: 'Quit' }
    ])

    // Close the menu
    if( game.keyboard.keyIsDown( 'c' ) ) {
      this.restorePreviousState()
    
      // Quit the game
    } else if( game.keyboard.keyIsDown('q') ) {
      game.changeState( new GameOver() )
      game.connection.protocol.sendQuitMessage()
    }
  }
}

/**
 * Shows a static "Game Over" screen when the game is lost
 */
export class GameOver extends MenuState {
  init() {
    Game.the().currentTunnel= null
    Game.the().currentVote= null
  }
  
  frame() {
    const game= Game.the()
    game.playfield.draw()

    this.drawMenuBox(120, 30, 'Game Over' )
  }

  isAlive() { return false }
}

/**
 * Shows a static "Victory" screen when the game is won
 */
export class Victory extends MenuState {
  frame() {
    const game= Game.the()
    game.playfield.draw()

    this.drawMenuBox(120, 30, 'Victory' )
  }
}
