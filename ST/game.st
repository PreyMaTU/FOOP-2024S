
RectangleMorph subclass: #Cat
	instanceVariableNames: ''
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
!

move
	self width: 32.
	self height: 32.
	
	owner changed.
!

step
	self move. 
!

stepTime
	^1000
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
	instanceVariableNames: 'window cat tunnels'
	classVariableNames: ''
	poolDictionaries: ''
	category: 'FOOP' !

!Playfield methodsFor: ''!
initialize
	super initialize.
	self color: (Color green adjustBrightness: -0.2).

	tunnels:= OrderedCollection new.
!

addTunnels
	"Hard code the layout of the map here"
	tunnels add: (Tunnel createFrom: {20@20. 80@20. 80@80} connectedBy: { 20@20. 80@20. 80@80. }).

	"Add all the drawables to the render tree"
	tunnels do: [:tunnel | tunnel addMorphsTo: self].
!

step
	"Make sure the game map background has the same dimensions as the window"
	self extent: owner panelRect extent. 
!

stepTime
	^33
! !


Object subclass: #Game
	instanceVariableNames: 'window playfield cat'
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
	playfield addTunnels.
	window addMorph: playfield.

	cat := Cat new.
	window addMorph: cat.
	cat position: 320@64 + window position.

	window openInWorld.
!

position
	^ playfield position
! !
