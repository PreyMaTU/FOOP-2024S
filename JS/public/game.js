
import { Renderer, SpriteSheet } from './renderer.js'
import { Colors } from './colors.js'
import { Playfield } from './playfield.js'
import { Keyboard } from './keyboard.js'
import * as State from './state.js'
import { ServerConnection } from './connection.js'
import { ClientProtocol } from './protocol.js'

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

    const connection= new ServerConnection(`ws://${window.location.host}/socket`, new ClientProtocol())
    await connection.open()
    const playerId= await connection.waitForConnection()
    console.log('Got player id from server:', playerId)

    const renderer= new Renderer( gameCanvas, font.family )
    const game= Game.instance= new Game( renderer, spriteSheet, playerId, connection )

    await game.playfield.load()

    return game
  }

  static the() {
    return Game.instance;
  }

  /** 
   * @param {Renderer} renderer 
   * @param {SpriteSheet} spriteSheet 
   * @param {number} playerId 
   * @param {ServerConnection} connection 
   */
  constructor( renderer, spriteSheet, playerId, connection ) {
    this.renderer= renderer
    this.spriteSheet= spriteSheet
    this.playfield= new Playfield()
    this.keyboard= new Keyboard()
    this.state= new State.OutsideTunnel()
    this.playerId= playerId
    this.connection= connection
    this.currentTunnel= null
    this.currentVote= null
    this.lastTimestamp= 0
    this.showHitboxes= false
    this.lastSentPacketTimestamp= 0
  }

  changeState( newState ) {
    this.state= newState
  }

  sendNetworkPackets( timeStamp ) {
    if( timeStamp - this.lastSentPacketTimestamp < 100 ) {
      return
    }

    this.lastSentPacketTimestamp= timeStamp
    this.playfield.sendNetworkPackets()
  }

  drawTopBar() {
    this.renderer.pushState()
    this.renderer.noStroke()
    this.renderer.fillColor= Colors.Black

    this.renderer.drawRectangle( 0, 0, this.renderer.width, 15 );

    this.renderer.fillColor= Colors.White
    this.renderer.textAlign= 'left'
    this.renderer.fontSize= 9
    this.renderer.drawText( 'Your Vote', 3, 3 )
    this.renderer.drawText( 'Votes', 110, 3 )
    this.renderer.drawText( 'Mice Left', 270, 3 )

    const ownVoteColor= this.currentVote ? this.currentVote.color : Colors.NoVote
    this.renderer.fillColor= ownVoteColor
    this.renderer.drawCircle( 67, 8, 4 )



    this.renderer.popState()
  }

  drawBottomBar() {
    this.renderer.pushState()
    this.renderer.noStroke()
    this.renderer.fillColor= Colors.Black

    const yOffset= this.renderer.height-15
    this.renderer.drawRectangle( 0, yOffset, this.renderer.width, 15 );

    this.renderer.fillColor= Colors.White
    this.renderer.textAlign= 'left'
    this.renderer.fontSize= 9

    this.renderer.drawText( 'Time', 3, yOffset+ 2)
    this.renderer.textAlign = 'right'
    this.renderer.drawText( 'Esc - Help', 317, yOffset+ 2)

    this.renderer.popState()
  }

  loop( timeStamp ) {
    // Handle server messages
    this.connection.updateGameFromMessages()

    // Run entity updates
    const timeDelta= this.lastTimestamp > 0 ? timeStamp- this.lastTimestamp : 0
    this.lastTimestamp= timeStamp
    this.playfield.update( timeDelta )

    // Make network messages every 100ms
    this.sendNetworkPackets( timeStamp )

    // Toggle hitbox drawing
    if( this.keyboard.keyWasPressed('h') ) {
      this.showHitboxes= !this.showHitboxes
    }

    // Draw entities
    // Clear background with grey color to spot under-drawing
    this.renderer.drawBackground( '#aaa' )

    this.drawTopBar()
    this.drawBottomBar()

    // End frame
    this.state.frame()
    this.keyboard.frame()

    // Send client messages
    this.connection.frameSendMessagesAndToggleBuffer()
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


