
!Morph methodsFor: 'FOOP'!
"Check whether the bounds of this and another morph's intersect"
boundsOverlapWith: morph
  ^self bounds intersects: morph bounds
! !

RectangleMorph subclass: #Cat
  instanceVariableNames: 'direction speed lastOvergroundPlayerPosition'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!Cat methodsFor: ''!
"Construct a new cat as a red rectangle with no movement by default"
initialize
  super initialize.
  self color: Color lightRed.
  self borderColor: Color red.

  self width: 32.
  self height: 32.

  direction:= 0@0.
!

"Sets the cat's movement speed"
withSpeed: catSpeed
  speed:= catSpeed.

  direction:= direction * speed.
!

"Updates the state of the cat in the current step. The cat tries to follow the
player mouse as long as it is visible overground."
updateState
  | vector |

  "Check if player is currently visible/overground"
  Game the currentTunnel ifNil: [
    lastOvergroundPlayerPosition := Game the playfield player position - Game the position.
  ].

  lastOvergroundPlayerPosition ifNil: [^self].

  "Move towards the last known player position, without jumping past it to prevent
  oscillation."
  vector := lastOvergroundPlayerPosition - (self position - Game the position).
  (vector dotProduct: vector) < speed ifTrue: [
    direction:= vector.

  ] ifFalse: [
    direction:= vector normalized * speed.
  ].
!

"Moves the cat according to direction vector."
move
  | currentPosition |
  currentPosition:= self position.

  self width: 32.
  self height: 32.
  
  self position: currentPosition+ direction.

  owner changed.
!

"End the game if boundaries of player and cat overlap. 
Only if player is not in a tunnel."
tryCatchPlayer
  (
    (Game the currentTunnel isNil) and:
    (Game the playfield player boundsOverlapWith: self)
  ) ifTrue: [
    Game the setLooseState
  ]
!

"Customized draw method to hide cat when player is underground"
drawOn: aCanvas
  "Do not show the cat when the player is underground"
  Game the currentTunnel ifNil: [
    super drawOn: aCanvas.
  ].
!

"Update the cat each step"
step
  self tryCatchPlayer.
  self move.
  self updateState.
!

"Update 30 times per second"
stepTime
  ^33
! !

RectangleMorph subclass: #PlayerMouse
  instanceVariableNames: ''
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!PlayerMouse methodsFor: ''!
"Construct a new player mouse as a blue rectangle"
initialize
  super initialize.
  self color: Color lightBlue.
  self borderColor: Color blue.

  self extent: 28@28.
!

"Set the tunnel the player mouse is currently in. If the player already is underground the tunnel is left
and therefore the games tunnel field gets reset. When underground the rendering of the underground 
geometry is enabled."
toggleTunnel: tunnel
  Transcript show: 'Got tunnel '; show: tunnel; cr.

  tunnel ifNotNil: [
    "Leaving the current tunnel"
    (Game the currentTunnel == tunnel) ifTrue: [
      Game the setTunnel: nil.
      ^self
    ].
    
    "Entering a new tunnel"
    Game the currentTunnel ifNil: [
      Game the setTunnel: tunnel.
      ^self
    ].
  ].
!

"Update the player mouse each step. The mouse is moved based on keyboard inputs. When
pressing the space bar on top of a tunnel portal, the tunnel is entered/left."
step
  | movement newPosition keyboard currentTunnel |

  keyboard:= Game the keyboard.

  Game the stillRunning ifTrue: [
    movement:= 0@0.

    "Check which key is pressed"
    (keyboard isKeyDown: 'w') ifTrue: [ movement:= 0@-3 ] ifFalse: [
    (keyboard isKeyDown: 'a') ifTrue: [ movement:= -3@0 ] ifFalse: [
    (keyboard isKeyDown: 's') ifTrue: [ movement:= 0@3 ] ifFalse: [
    (keyboard isKeyDown: 'd') ifTrue: [ movement:= 3@0 ] ]]].

    newPosition:= self position+ movement.

    "Enter or leave tunnel when on top of a tunnel portal"
    (keyboard wasKeyPressed: ' ') ifTrue: [
      self toggleTunnel: Game the playfield tunnelInReachOfPlayer.
    ].

    "Clamp position to the tunnel walls when inside one"
    currentTunnel:= Game the currentTunnel.
    currentTunnel ifNotNil: [
      newPosition:= currentTunnel clampPositionToNearestSegment: newPosition.
    ].

    self position: newPosition.
  ].

  "Reset the pressed keys"
  keyboard updateClear.
!

"Update 30 times per second"
stepTime
  ^33
! !


CircleMorph subclass: #TunnelPortal
  instanceVariableNames: 'indicator'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!TunnelPortal class methodsFor: ''!
"Static constructor for a tunnel with a color and position"
withColor: aColor at: aPosition
  | portal |
  portal:= TunnelPortal new.
  portal tunnelColor: aColor.
  portal position: aPosition.
  ^portal
! !

!TunnelPortal methodsFor: ''!
"Contruct a new tunnel portal with predefined color and position"
initialize
  super initialize.
  self color: Color gray.
  self borderColor: Color black.

  self extent: 40@40.

  "Add the colored indicator dot in the middle"
  indicator:= CircleMorph new.
  indicator extent: 10@10.
  self position: self position.

  self addMorph: indicator.
!

"Set the position of the tunnel portal"
position: aPosition
  super position: aPosition.
  indicator position: aPosition + (15@15).
!

"Set the color of the tunnel protal"
tunnelColor: aColor
  indicator color: aColor.
  indicator borderColor: aColor.
! !

Morph subclass: #TunnelGeometry
instanceVariableNames: 'vertecies visible'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!TunnelGeometry class methodsFor: ''!
"Static constructor to create a tunnel geometry with vertecies"
fromVertecies: vertecies
  | geometry |
  geometry := TunnelGeometry new.
  geometry setVertecies: vertecies.
  ^geometry
! !

!TunnelGeometry methodsFor: ''!
"Construct a new tunnel geometry at a predefined position"
initialize
  super initialize.

  self position: Game the position.
  visible:= true.
!

"Set the vertecies of the tunnel geometry"
setVertecies: newVertecies
  vertecies := newVertecies	
!

"Set the visibility flag. When visible the geometry gets drawn."
visible: visibility
  visible := visibility	
!

"Draw the geometry as thick lines between the tunnel portals based on the vertecies
directly on to the canvas."
drawOn: canvas
  visible ifTrue: [
    "Draw the geometry as a series of overlapping rectangles"
    1 to: (vertecies size - 1) do: [ :i |
      | start end direction position size |
      start := vertecies at: i.
      end := vertecies at: (i + 1).
      direction := (end - start).

      "Origin is always in the top left"
      position := start + (direction min: 0@0).

      "Over extend the tunnel a little so they connect and reach under the portal"
      size := (direction abs + 30) max: 30@30.
      canvas fillRectangle: ((Game the position + position) extent: size) color: Color white.
    ]
  ]
!

"Compute the nearest position inside the tunnel geometry"
clampPositionToNearestSegment: position
  | closestDistanceSquared closestClampedPoint windowOffset |

  "For a detailed description of this method see the JS version"

  closestDistanceSquared:= Float infinity.
  closestClampedPoint:= nil.
  windowOffset:= Game the position.

  1 to: (vertecies size - 1) do: [ :i |
    | start end segment direction t closestPointOnSegment vectorToclosestPointOnSegment closestDistanceToSegmentSquared |
    start := windowOffset + vertecies at: i.
    end := windowOffset + vertecies at: (i + 1).
    
    segment := (end - start).
    direction := (position - start).

    t:= ((direction dotProduct: segment) / (segment dotProduct: segment)) min: 1 max: 0.

    closestPointOnSegment:= start + (segment * t).
    vectorToclosestPointOnSegment:= position - closestPointOnSegment.
    closestDistanceToSegmentSquared:= vectorToclosestPointOnSegment dotProduct: vectorToclosestPointOnSegment.

    (closestDistanceToSegmentSquared < closestDistanceSquared) ifTrue: [
      closestDistanceSquared:= closestDistanceToSegmentSquared.
      closestClampedPoint:= closestPointOnSegment.
    ].
  ].

  ^closestClampedPoint
!

"Update 30 times per second"
stepTime
  ^33
! !


Object subclass: #Tunnel
  instanceVariableNames: 'portals geometry parentMorph tunnelColor'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!Tunnel class methodsFor: ''!
"Static constructor to create a tunnel with a color, positions of the portals and vertices
to define the underground geometry"
withColor: color createFrom: portalPositions connectedBy: vertecies
  | tunnel |
  tunnel := Tunnel new.
  tunnel setColor: color setPortals: portalPositions setVertecies: vertecies.
  ^tunnel
! !

!Tunnel methodsFor: ''!
initialize
  portals := OrderedCollection new.
!

"Populate all fields of the tunnel. Used by the static constructor to initialize the object"
setColor: aColor setPortals: portalPositions setVertecies: vertecies
  tunnelColor:= aColor.

  "Add all the portals"
  portalPositions do: [ :position |
    portals add: (TunnelPortal withColor: tunnelColor at: (Game the position + position) ).
  ].

  "Create the geometry"
  geometry:= TunnelGeometry fromVertecies: vertecies.
  geometry visible: false.
!

"Adds the tunnel's mophs to a provided parent morph for displaying."
addMorphsTo: parent
  parentMorph := parent.

  "Draw tunnel geometry behind the portals"
  parentMorph addMorph: geometry.

  portals do: [:portal | parentMorph addMorph: portal].
!

"Turn the undergound geometry visible when entering the tunnel"
enter
  geometry visible: true
!

"Turn the undergound geometry invisible when leaving the tunnel"
exit
  geometry visible: false
!

"Get the tunnel indicator color"
tunnelColor
  ^tunnelColor
!

"Clamps a position on the playfield to the nearest position inside the tunnel geometry"
clampPositionToNearestSegment: position
  ^geometry clampPositionToNearestSegment: position
!

"Check if a morph overlaps with any of the tunnel's portal"
portalOverlapsWith: morph
  portals do: [:portal | 
    (portal boundsOverlapWith: morph) ifTrue: [^true]
  ].

  ^false
! !



Morph subclass: #Playfield
  instanceVariableNames: 'cat player tunnels'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!Playfield methodsFor: ''!
"Construct the playfield with a background color, tunnels, a cat and a player mouse"
initialize
  super initialize.
  self color: (Color green adjustBrightness: -0.2).
  self clipSubmorphs: true.

  tunnels:= OrderedCollection new.

  cat:= Cat new.
  player:= PlayerMouse new.
!

"Build the contents of the playfield by instantiating the player, cat and tunnels."
buildMap
  owner ifNil: [
    Transcript show: 'Error: Detached Playfield'.
    ^self
  ].

  "Hard code the layout of the map"
  tunnels add: (Tunnel
    withColor: (Color red)
    createFrom: {20@20. 120@20. 120@80}
    connectedBy: { 20@20. 120@20. 120@80. }
  ).
  tunnels add: (Tunnel 
    withColor: (Color blue) 
    createFrom: {30@250. 100@200. 240@240} 
    connectedBy: { 30@250. 100@250. 100@200. 240@200. 240@240 }
  ).
  tunnels add: (Tunnel 
    withColor: (Color green) 
    createFrom: {300@250. 380@290} 
    connectedBy: { 300@250. 300@180. 450@180. 450@230. 360@230. 360@290. 380@290 }
  ).
  tunnels add: (Tunnel 
    withColor: (Color orange) 
    createFrom: {240@30. 550@30. 550@240. 400@130} 
    connectedBy: { 240@30. 550@30. 550@240. 400@240. 400@130 }
  ).

  "Add all the drawables to the render tree"
  tunnels do: [:tunnel | tunnel addMorphsTo: self].

  "Init the cat"
  self addMorph: cat.
  cat position: 320@64 + (owner position).
  cat withSpeed: 3.

  "Init the player"
  self addMorph: player.
  player position: (owner position)+ (owner extent / 2).
!

"Try to find a tunnel the player mouse can interact with, or return nil."
tunnelInReachOfPlayer
  tunnels do: [:tunnel |
    (tunnel portalOverlapsWith: player) ifTrue: [^tunnel]
  ].

  ^nil
!

"Get a random tunnel indicator color"
randomTunnelColor
  ^(tunnels atRandom) tunnelColor
!

"Get the player mouse object"
player
  ^player
!

"Detect that the game window is closing. Unfortunately there seems to be no way to
set a callback on the SystemWindow itself, so we need to employ this hack to inform
the game to shutdown."
outOfWorld: aWorld
  super outOfWorld: aWorld.

  Transcript show: 'Playfield removed'.
  Game the shutdown: true.
!

"Update the playfield each step."
step
  "Make sure the game map background has the same dimensions as the window"
  self extent: owner panelRect extent. 
!

"Update 30 times per second"
stepTime
  ^33
! !

StaticTextMorph subclass: #GameTimer
  instanceVariableNames: 'seconds'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!GameTimer class methodsFor: ''!
"Static Constructor for a game timer with a game duration.
The Game ends after the given time specified in seconds"
runFor: seconds
  | timer |
  timer:= GameTimer new.
  timer seconds: seconds.
  ^timer
! !

!GameTimer methodsFor: ''!
initialize
  super initialize.

  self backgroundColor: Color black.
  self textColor: Color white.
!

"Set the number of remaining seconds before the game ends."
seconds: secs
  seconds:= secs.
  self printTime.
!

"Clear the timer. Sets the seconds to 0."
clear
 self seconds: 0.
!

"Print a number with a specified number of padded zeros"
paddedNumberString: aNumber to: zeros
  | string |
  string:= aNumber asString.
  (string size + 1) to: zeros do: [ :i | string := '0', string ].
  ^string
!

"Display the currently remaining time as a formated mm:ss string."
printTime
  | secs mins |
  mins := (seconds / 60) floor.
  secs := seconds rem: 60.

  mins := self paddedNumberString: mins to: 2.
  secs := self paddedNumberString: secs to: 2.

  self contents: (mins, ':', secs).
!

"Decrease the timer by a second each step.
When the timer over, the game is lost"
step
  seconds:= (seconds- 1) max: 0.
  self printTime.

  "End the game when no time is left"
  (seconds <= 0) ifTrue: [
    Game the setLooseState
  ].
!

"Update the timer every second"
stepTime
  ^1000
! !

RectangleMorph subclass: #TextBanner
  instanceVariableNames: 'text fontName fontSize'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!TextBanner methodsFor: ''!
"Construct a Textbanner with black background which spans the window horizantally
and has a centered text."
initialize
  super initialize.

  self color: Color black.
  self borderColor: Color black.
  
  fontName := (TextStyle defaultFont familyName).
  fontSize := 60.
  
  text := StaticTextMorph new.
  text textColor: Color white.

  self addMorph: text.
!

"Set the message to display inside the banner"
message: message
  text string: message fontName: fontName size: fontSize.
  self alignSelf.
!

"Compute own position and the position of the contained text based
on the windows position and extent."
alignSelf
  | win textHeight padding posX posY|

  textHeight:= 50.
  padding := 20.
  win := owner panelRect.

  posX := win origin x.
  posY := win origin y + (win extent y / 2) - ((textHeight + padding)/ 2 ).

  "Place ourself as a y-centered banner across the window"
  self
    extent: (win extent x)@(textHeight+ 10);
    position: (posX@posY) asIntegerPoint.

  "Put the text onto the banner with padding offset"
  text
    position: self position + (0@(padding / 2));
    extent: (self extent x)@fontSize;
    centered.
!

"Re-align the textbanner within the window each step"
step
  self alignSelf.
!

"Update 30 times per second"
stepTime
  ^33
! !

Object subclass: #GameKeyboard
  instanceVariableNames: 'window keysDown keysPressed'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!GameKeyboard class methodsFor: ''!
"Static constructor for binding the keyboard listener to the window"
forWindow: window
  | keyboard |
  keyboard:= GameKeyboard new.
  keyboard window: window.
  ^keyboard
! !

!GameKeyboard methodsFor: ''!
initialize
  keysDown:= Set new.
  keysPressed:= Set new.
!

"Detach the keyboard listener from the window if one is currently set"
detach
   window ifNotNil: [
    window currentHand removeKeyboardListener: self.
    window := nil.
  ]
!

"Attach the keyboard listener to a new window after detaching from the old one."
window: aWindow
 self detach.

  window:= aWindow.
  window currentHand addKeyboardListener: self.
!

"Callback for receiving input events"
handleListenEvent: event
  | keyName |

  "Only process keyboard events when the window is active"
  (event isKeyboard not or: (window isActive not))  ifTrue: [
    ^self
  ].

  "Get the key type as a string"
  keyName := event keyString asLowercase.
  keyName size < 1 ifTrue: [
    ^self
  ].

  "Remeber that the key is held down"
  event isKeyDown ifTrue: [
    keysDown add: keyName.
    ^self
  ].

  "Remove the key from the set of held keys"
  event isKeyUp ifTrue: [
    (keysDown includes: keyName) ifTrue: [
      keysDown remove: keyName.
      keysPressed add: keyName.
    ].
    ^self
  ].
!

"Check if a key is currently held down"
isKeyDown: key
  ^keysDown includes: key
!

"Check if a key was pressed since last clearing update"
wasKeyPressed: key
  ^keysPressed includes: key
!

"Clear the pressed keys set"
updateClear
  keysPressed removeAll
! !

Object subclass: #Game
  instanceVariableNames: 'window playfield keyboard timer currentTunnel targetTunnelColor state'
  classVariableNames: 'Instance'
  poolDictionaries: ''
  category: 'FOOP' !

!Game class methodsFor: ''!
"Create a new game as a singleton and replace an old instace if one exists"
create
  Instance ifNotNil: [
    Transcript show: 'Replacing old instance';cr.
    Instance shutdown.
  ].

  Transcript show: 'Starting game...';cr.
  Instance := Game new.
  Instance begin.
!

"Returns the instance of the game"
the
  ^Instance
! !

!Game methodsFor: ''!
initialize
  state:= #running.
  window := SystemWindow new.

  window position: 100@100.
  window extent: 640@480.
  window setLabel: 'FOOP Game'.
!

"Starts the game by creating all components and entities. This
mehtod runs after the constructor, so that the singelton instance
is already available."
begin
  Transcript show: 'Begin';cr.
  keyboard := GameKeyboard forWindow: window.

  "Set up playfield"
  playfield := Playfield new.
  playfield position: window panelRect origin.
  playfield extent: window panelRect extent.

  window addMorph: playfield.
  playfield buildMap.

  "Set up and start timer"
  timer := GameTimer runFor: 180.
  timer position: window panelRect origin.
  window addMorph: timer.

  "Select a random tunnel the player must reach to win"
  targetTunnelColor:= playfield randomTunnelColor.

  window openInWorld.
!

"Shut down the game programmatically"
shutdown
  self shutdown: false
!

"Shut down the game by detaching event listeners, stopping the timer and cllosing the window.
When the game stops due to closing the window, we cannot close it again."
shutdown: dueToWindowClose
  keyboard ifNotNil: [ keyboard detach ].
  timer ifNotNil: [ timer clear ].
  state := #lost.

  (dueToWindowClose not and: (window isNil not)) ifTrue: [
    window delete.
  ].
!

"Leave the tunnel if the player mouse is currently inside one.
Enter the tunnel if the mouse is outside and check if it was the winning tunnel"
setTunnel: tunnel
  currentTunnel ifNotNil: [
    currentTunnel exit
  ].

  currentTunnel:= tunnel.
  currentTunnel ifNotNil: [
    currentTunnel enter.

    self checkWinState.
  ]
!

"Check whether the game is won. The game has to be still running and the player mouse
has to be in the right tunnel."
checkWinState
  (
    (self stillRunning) and: (
    (currentTunnel isNil not) and: (
    (currentTunnel tunnelColor = targetTunnelColor) ))
  ) ifTrue: [
    Transcript show: 'Game won'; cr.

    state:= #won.
    self showGameOverMessage.
  ].
!

"Set the game to lost and show the game over message onscreen."
setLooseState
  self stillRunning ifTrue: [
    Transcript show: 'Game over'; cr.

    state:= #lost.
    self showGameOverMessage.
  ].
!

"Print the respective game over banner onscreen. Either displays 'Game won'
or 'Game lost' as a banner text based on the game state."
showGameOverMessage
  | message banner |
  
  message := state = #won ifTrue: ['Game won'] ifFalse: ['Game lost'].

  banner:= TextBanner new.
  window addMorph: banner.
  banner message: message.
!

"Check whether the game is still running."
stillRunning
  ^state = #running
!

"Get the position of the playfield in the world"
position
  ^ playfield position
!

"Get the playfield object"
playfield
  ^playfield
!

"Get the keyboard object"
keyboard
  ^keyboard
!

"Get the current tunnel object or nil."
currentTunnel
  ^currentTunnel
! !
