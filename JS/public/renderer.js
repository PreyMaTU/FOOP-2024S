
class RenderState {
  constructor() {
    this.fillColor= 'white'
    this.strokeColor= 'black'
    this.strokeWeight= 1
    this.doFill= true
    this.doStroke= true
  }

  applyAll( context ) {
    context.fillStyle = this.fillColor
    context.strokeStyle = this.strokeColor
    context.lineWidth = this.strokeWeight
  }

  applyFillColor( context ) {
    context.fillStyle = this.fillColor
  }
}

export class Renderer {
  constructor( canvas ) {
    this.canvas= canvas
    this.context= this.canvas.getContext('2d')
    this.states= [ new RenderState() ]

    this._currentState.applyAll( this.context );

    this.createFilter( 'remove-alpha' )
    this.context.filter= 'url(#remove-alpha)'
  }

  createFilter( filterId ) {
    function createSVGElement( tagName, attributes ) {
      const svgNamespace= 'http://www.w3.org/2000/svg'
      const element= document.createElementNS( svgNamespace, tagName )
      for( const attribute in attributes ) {
        element.setAttributeNS( null, attribute, attributes[attribute] )
      }

      return element
    }

    document.body
      .insertBefore( createSVGElement('svg', {width: 0, height: 0, style: 'position: absolute; z-index: -1;'}), document.body.firstChild )
      .appendChild( createSVGElement('defs') )
      .appendChild( createSVGElement('filter', {id: filterId, x: 0, y: 0, width: '100%', height: '100%'}) )
      .appendChild( createSVGElement('feComponentTransfer') )
      .appendChild( createSVGElement('feFuncA', {type: 'discrete', tableValues: '0 1'}) )
   }
  
  get _currentState() {
    return this.states[ this.states.length -1 ]
  }
  
  get height() {
    return this.canvas.height
  }
  
  get width() {
    return this.canvas.width
  }
  
  // TODO: Implement setting doFill/doStroke to false 
  set fillColor( color ) {
    this._currentState.doFill = true
    this._currentState.fillColor = color
    this.context.fillStyle = color
  }

  set strokeColor( color ) {
    this._currentState.doStroke = true
    this._currentState.strokeColor = color
    this.context.strokeStyle = color
  }

  set strokeWeight( width ) {
    this._currentState.doStroke = true
    this._currentState.strokeWeight = width
    this.context.lineWidth = width
  }
  
  background( color ) {
    this.context.fillStyle= color
    this.context.fillRect(0, 0, this.width, this.height)
    this._currentState.applyFillColor( this.context )
  }

  drawCircle(centerX, centerY, radius ) {
    this.context.beginPath()
    this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
    
    if( this._currentState.doFill ) {
      this.context.fill()
    }
    
    if( this._currentState.doStroke ) {
      this.context.stroke()
    }
  }
}
