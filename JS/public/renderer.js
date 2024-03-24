
/** The Renderer draws the game map elements on the canvas */
export class Renderer {
  #canvas
  #context

  /** @param {HTMLCanvasElement} canvas */
  constructor( canvas ) {
    this.#canvas= canvas
    this.#context= this.#canvas.getContext('2d')
    
    this.#createFilter( 'remove-alpha' )
    this.#context.filter= 'url(#remove-alpha)'
  }

  /** Creates a filter to disable aliasing, ensuring a pixelated look of objects */
  #createFilter( filterId ) {
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

  #completePath() {
    if( this.#context.fillStyle !== '#0000' ) {
      this.#context.fill()
    }

    if( this.#context.strokeStyle !== '#0000' ) {
      this.#context.stroke()
    }
  }

  /** Saves current set of drawing options */
  pushState() {
    this.#context.save()
  }

  /** Return to previously saved set drawing options */
  popState() {
    this.#context.restore()
  }
  
  get height() {
    return this.#canvas.height
  }
  
  get width() {
    return this.#canvas.width
  }
  
  // TODO: Implement setting doFill/doStroke to false 
  set fillColor( color ) {
    this.#context.fillStyle = color
  }

  set strokeColor( color ) {
    this.#context.strokeStyle = color
  }

  set strokeWeight( width ) {
      this.#context.lineWidth = width
  }
  
  drawBackground( color ) {
    const oldFillStyle= this.#context.fillStyle
    this.#context.fillStyle= color
    this.#context.fillRect(0, 0, this.width, this.height)
    this.#context.fillStyle= oldFillStyle
  }

  drawCircle(centerX, centerY, radius ) {
    this.#context.beginPath()
    this.#context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
    this.#completePath()
  }
  }
}
