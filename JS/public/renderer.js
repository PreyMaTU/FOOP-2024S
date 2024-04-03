
export class SpriteSheet {
  constructor( url ) {
    this.url= url
    this.image= null
    this.bitmaps= new Map()
  }

  async load() {
    if( !this.image ) {
      return new Promise((res, rej) => {
        this.image= new Image()
        this.image.onload= () => res()
        this.image.onerror= rej
        this.image.src= this.url
      })
    }
  }

  async sprites( config ) {
    for( const name in config ) {
      const {x, y, w, h}= config[name]
      const bitmap= await createImageBitmap( this.image, x, y, w, h )
      this.bitmaps.set(name, bitmap)
    }
  }

  get( name ) {
    return this.bitmaps.get( name ) || null
  }
}

/** The Renderer draws the game map elements on the canvas */
export class Renderer {
  #canvas
  #context

  /** @param {HTMLCanvasElement} canvas */
  constructor( canvas ) {
    this.#canvas= canvas
    this.#context= this.#canvas.getContext('2d')
    
    this.#context.font= '8px Consolas'
    this.#context.textBaseline= 'top'
    this.#context.textAlign= 'left'

    this.#createFilter( 'remove-alpha' )
    this.enableFilter()
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

  enableFilter( enable= true ) {
    this.#context.filter= enable ? 'url(#remove-alpha)' : 'none'
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
  
  set fillColor( color ) {
    this.#context.fillStyle = color
  }

  set strokeColor( color ) {
    this.#context.strokeStyle = color
  }

  set strokeWeight( width ) {
    this.#context.lineWidth = width
  }

  set fontSize( size ) {
    this.#context.font= `${size}px Consolas`
  }

  set textAlign( align ) {
    this.#context.textAlign= align
  }

  /** Disabled stroke by setting transparent color */
  noStroke() {
    this.#context.strokeStyle= '#0000'
  }

  /** Disabled fill by setting transparent color */
  noFill() {
    this.#context.fillStyle= '#0000'
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

  drawRectangle( leftTopX, leftTopY, width, height ) {
    this.#context.beginPath()
    this.#context.rect(leftTopX, leftTopY, width, height)
    this.#completePath()
  }

  drawImage( image, posX, posY ) {
    this.#context.drawImage( image, Math.round(posX), Math.round(posY) )
  }

  drawImageMirrored( image, posX, posY ) {
    this.#context.scale(-1, 1)
    this.#context.drawImage( image, -Math.round(posX)- image.width, Math.round(posY) )
    this.#context.scale(-1, 1)
  }

  drawPath( vertices ) {
    this.#context.beginPath()

    vertices.forEach( ([x, y], idx) => {
      if( !idx ) {
        this.#context.moveTo( x, y )        
      } else {
        this.#context.lineTo( x, y )
      }
    })

    this.#completePath()
  }

  drawText( text, posX, posY ) {
    this.#context.fillText( text, posX, posY )
  }
}
