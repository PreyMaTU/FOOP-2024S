
!Morph methodsFor: 'FOOP'!
boundsOverlapWith: morph
  |a b|
  a:= self bounds.
  b:= morph bounds.

  "No area means no possbile overlap"
  (
    (a corner x- a origin x <= 0) or: (
    (a corner y - a origin y <= 0) or: (
    (b corner x- b origin x <= 0) or: (
    (b corner y - b origin y <= 0) )))
  ) ifTrue: [
    ^false
  ].

  "Hitboxes above or besides each other"
  (
    (a origin x > b corner x) or: ( (b origin x > a corner x) or: (
    (a origin y > b corner y) or: ( (b origin y > a corner y) )))
  ) ifTrue: [
    ^false
  ].

  ^true
! !

RectangleMorph subclass: #Cat
  instanceVariableNames: 'state direction initialPosition pathWidth pathHeight speed'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!Cat methodsFor: ''!
initialize
  super initialize.
  self color: Color lightRed.
  self borderColor: Color red.

  self width: 32.
  self height: 32.

  state:= #right.
  direction:= 1@0.
!

beginPath: path withSpeed: catSpeed
  initialPosition:= self position - Game the position.
  pathWidth:= path x.
  pathHeight:= path y.
  speed:= catSpeed.

  direction:= direction * speed.
!

updateState
  | currentPosition |
  currentPosition:= self position - Game the position.

  state = #up ifTrue: [ 
    (currentPosition y <= initialPosition y) ifTrue: [
      state:= #right.
      direction:= 1@0 * speed.
    ]
  ] ifFalse: [
    state = #down ifTrue: [ 
      (currentPosition y - initialPosition y >= pathHeight) ifTrue: [
        state:= #left.
        direction:= -1@0 * speed.
      ]
    ] ifFalse: [
      state = #left ifTrue: [ 
        (currentPosition x <= initialPosition x) ifTrue: [
          state:= #up.
          direction:= 0@-1 * speed.
        ]
      ] ifFalse: [
        state = #right ifTrue: [ 
          (currentPosition x - initialPosition x >= pathWidth) ifTrue: [
            state:= #down.
            direction:= 0@1 * speed.
          ]
        ] ifFalse: [
          Transcript show: 'Error: Unknown state'; show: state; cr.
        ]
      ]
    ]
  ]
!

move
  | currentPosition |
  currentPosition:= self position.

  self width: 32.
  self height: 32.
  
  self position: currentPosition+ direction.

  owner changed.
!

step
  self move.
  self updateState.
!

stepTime
  ^33
! !

RectangleMorph subclass: #PlayerMouse
  instanceVariableNames: ''
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!PlayerMouse methodsFor: ''!
initialize
  super initialize.
  self color: Color lightBlue.
  self borderColor: Color blue.

  self extent: 28@28.
!

toggleTunnel: tunnel
  Transcript show: 'Got tunnel '; show: tunnel; cr.
!

step
  | movement keyboard |

  movement:= 0@0.

  keyboard:= Game the keyboard.
  (keyboard isKeyDown: 'w') ifTrue: [ movement:= 0@-3 ] ifFalse: [
  (keyboard isKeyDown: 'a') ifTrue: [ movement:= -3@0 ] ifFalse: [
  (keyboard isKeyDown: 's') ifTrue: [ movement:= 0@3 ] ifFalse: [
  (keyboard isKeyDown: 'd') ifTrue: [ movement:= 3@0 ] ]]].

  self position: self position+ movement.

  (keyboard wasKeyPressed: ' ') ifTrue: [
    self toggleTunnel: Game the playfield tunnelInReachOfPlayer.
  ].

  keyboard updateClear.
!

stepTime
  ^33
! !


CircleMorph subclass: #TunnelPortal
  instanceVariableNames: 'indicator'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!TunnelPortal class methodsFor: ''!
withColor: aColor at: aPosition
  | portal |
  portal:= TunnelPortal new.
  portal tunnelColor: aColor.
  portal position: aPosition.
  ^portal
! !

!TunnelPortal methodsFor: ''!
initialize
  super initialize.
  self color: Color gray.
  self borderColor: Color black.

  self extent: 40@40.

  indicator:= CircleMorph new.
  indicator extent: 10@10.
  self position: self position.

  self addMorph: indicator.
!

position: aPosition
  super position: aPosition.
  indicator position: aPosition + (15@15).
!

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
fromVertecies: vertecies
  | geometry |
  geometry := TunnelGeometry new.
  geometry setVertecies: vertecies.
  ^geometry
! !

!TunnelGeometry methodsFor: ''!
initialize
  super initialize.

  self position: Game the position.
  visible:= true.
!

setVertecies: newVertecies
  vertecies := newVertecies	
!

setVisibility: visibility
  visible := visibility	
!

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

stepTime
  ^33
! !


Object subclass: #Tunnel
  instanceVariableNames: 'portals geometry parentMorph tunnelColor'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!Tunnel class methodsFor: ''!
withColor: color createFrom: portalPositions connectedBy: vertecies
  "Static constructor helper"
  | tunnel |
  tunnel := Tunnel new.
  tunnel setColor: color setPortals: portalPositions setVertecies: vertecies.
  ^tunnel
! !

!Tunnel methodsFor: ''!
initialize
  portals := OrderedCollection new.
!

setColor: aColor setPortals: portalPositions setVertecies: vertecies
  "Populate the tunnel's components"
  tunnelColor:= aColor.

  portalPositions do: [ :position |
    portals add: (TunnelPortal withColor: tunnelColor at: (Game the position + position) ).
  ].

  geometry:= TunnelGeometry fromVertecies: vertecies
!

addMorphsTo: parent
  parentMorph := parent.

  "Draw tunnel geometry behind the portals"
  parentMorph addMorph: geometry.

  portals do: [:portal | parentMorph addMorph: portal].
!

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
initialize
  super initialize.
  self color: (Color green adjustBrightness: -0.2).
  self clipSubmorphs: true.

  tunnels:= OrderedCollection new.

  cat:= Cat new.
  player:= PlayerMouse new.
!

buildMap
  owner ifNil: [
    Transcript show: 'Error: Detached Playfield'.
    ^self
  ].

  "Hard code the layout of the map here"
  tunnels add: (Tunnel withColor: (Color red)  createFrom: {20@20. 120@20. 120@80} connectedBy: { 20@20. 120@20. 120@80. }).
  tunnels add: (Tunnel withColor: (Color blue) createFrom: {30@250. 100@200. 240@240} connectedBy: { 30@250. 100@250. 100@200. 240@200. 240@240 }).

  "Add all the drawables to the render tree"
  tunnels do: [:tunnel | tunnel addMorphsTo: self].

  "Init the cat"
  self addMorph: cat.
  cat position: 320@64 + (owner position).
  cat beginPath: 60@60 withSpeed: 3.

  "Init the player"
  self addMorph: player.
  player position: (owner position)+ (owner extent / 2).
!

tunnelInReachOfPlayer
  tunnels do: [:tunnel |
    (tunnel portalOverlapsWith: player) ifTrue: [^tunnel]
  ].

  ^nil
!

step
  "Make sure the game map background has the same dimensions as the window"
  self extent: owner panelRect extent. 
!

stepTime
  ^33
! !

Object subclass: #GameKeyboard
  instanceVariableNames: 'window keysDown keysPressed'
  classVariableNames: 'Instance'
  poolDictionaries: ''
  category: 'FOOP' !

!GameKeyboard class methodsFor: ''!
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

window: aWindow
  window ifNotNil: [
    window currentHand removeKeyboardListener: self
  ].

  window:= aWindow.
  window currentHand addKeyboardListener: self.
!

handleListenEvent: event
  | keyName |

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

isKeyDown: key
  ^keysDown includes: key
!

wasKeyPressed: key
  ^keysPressed includes: key
!

updateClear
  keysPressed removeAll
! !

Object subclass: #Game
  instanceVariableNames: 'window playfield keyboard'
  classVariableNames: 'Instance'
  poolDictionaries: ''
  category: 'FOOP' !

!Game class methodsFor: ''!
"Helpers for the Game singelton"
create
  Instance ifNotNil: [
    Transcript show: 'Replacing old instance';cr.	
  ].

  Transcript show: 'Starting game...';cr.
  Instance := Game new.
  Instance begin.
!

the
  ^Instance
! !

!Game methodsFor: ''!
initialize
  window := SystemWindow new.

  window position: 100@100.
  window extent: 640@480.
  window setLabel: 'FOOP Game'.
!

begin
  "Starts the game by creating all components and entities. This
  mehtod runs after the constructor, so that the singelton instance
  is already available."

  Transcript show: 'Begin';cr.
  keyboard := GameKeyboard forWindow: window.

  playfield := Playfield new.
  playfield position: window panelRect origin.
  playfield extent: window panelRect extent.

  window addMorph: playfield.
  playfield buildMap.

  window openInWorld.
!

position
  ^ playfield position
!

playfield
  ^playfield
!

keyboard
  ^keyboard
! !
