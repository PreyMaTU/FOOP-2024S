
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

CircleMorph subclass: #PlayerMouse
  instanceVariableNames: 'keys'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!PlayerMouse methodsFor: ''!
initialize
  super initialize.
  self color: Color lightBlue.
  self borderColor: Color blue.

  self extent: 28@28.

  keys:= Set new.
!

handleListenEvent: event
  | keyName |

  event isKeyboard ifFalse: [
    ^self
  ].

  "Get the key type as a string"
	keyName := event keyString asLowercase.
  keyName size < 1 ifTrue: [
    ^self
  ].

  "Remeber that the key is held down"
  event isKeyDown ifTrue: [
    keys add: keyName.
    ^self
  ].

  "Remove the key from the set of held keys"
  event isKeyUp ifTrue: [
    keys remove: keyName ifAbsent: [].  
    ^self
  ].
!

intoWorld: aWorld
  super intoWorld: aWorld.

  "Add ourselves as an event listener for keyboard events"
  self currentHand addKeyboardListener: self.
!

outOfWorld: aWorld
  self currentHand removeKeyboardListener: self.
  super outOfWorld: aWorld.
!

step
  | movement |

  movement:= 0@0.

  (keys includes: 'w') ifTrue: [ movement:= 0@-3 ] ifFalse: [
  (keys includes: 'a') ifTrue: [ movement:= -3@0 ] ifFalse: [
  (keys includes: 's') ifTrue: [ movement:= 0@3 ] ifFalse: [
  (keys includes: 'd') ifTrue: [ movement:= 3@0 ] ]]].

  self position: self position+ movement.
!

stepTime
  ^33
! !


CircleMorph subclass: #TunnelPortal
  instanceVariableNames: ''
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP'!

!TunnelPortal methodsFor: ''!
initialize
  super initialize.
  self color: Color gray.
  self borderColor: Color black.

  self extent: 40@40
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
  instanceVariableNames: 'portals geometry parentMorph'
  classVariableNames: ''
  poolDictionaries: ''
  category: 'FOOP' !

!Tunnel class methodsFor: ''!
createFrom: portalPositions connectedBy: vertecies
  "Static constructor helper"
  | tunnel |
  tunnel := Tunnel new.
  tunnel setPortals: portalPositions setVertecies: vertecies.
  ^tunnel
! !

!Tunnel methodsFor: ''!
initialize
  portals := OrderedCollection new.
!

setPortals: portalPositions setVertecies: vertecies
  "Populate the tunnel's components"
  portalPositions do: [ :position |
    portals add: (TunnelPortal new position: (Game the position + position) ).
  ].

  geometry:= TunnelGeometry fromVertecies: vertecies
!

addMorphsTo: parent
  parentMorph := parent.

  "Draw tunnel geometry behind the portals"
  parentMorph addMorph: geometry.

  portals do: [:portal | parentMorph addMorph: portal].
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
  tunnels add: (Tunnel createFrom: {20@20. 80@20. 80@80} connectedBy: { 20@20. 80@20. 80@80. }).

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

step
  "Make sure the game map background has the same dimensions as the window"
  self extent: owner panelRect extent. 
!

stepTime
  ^33
! !


Object subclass: #Game
  instanceVariableNames: 'window playfield'
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
  window setNameTo: 'FOOP Game'.
!

begin
  "Starts the game by creating all components and entities. This
  mehtod runs after the constructor, so that the singelton instance
  is already available."
  
  Transcript show: 'Begin';cr.
  playfield := Playfield new.
  playfield position: window panelRect origin.
  playfield extent: window panelRect extent.

  window addMorph: playfield.
  playfield buildMap.

  window openInWorld.
!

position
  ^ playfield position
! !
