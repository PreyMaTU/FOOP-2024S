
export function abstractMethod() {
  throw Error('Abstract Method');
}

export function sampleArray( array ) {
  return array.length ? array[ Math.floor( Math.random() * array.length ) ] : undefined
}

export function sampleSubArray( array, len ) {
  if(array.length < len) {
    return []
  }
  
  const idx= Math.floor( Math.random() * (array.length- len+ 1) )
  return array.slice( idx, idx+ len )
}

export class Vector {
  constructor( x, y ) {
    if( Array.isArray(x) ) {
      this.x= x[0]
      this.y= x[1]

    } else if( x instanceof Vector ) {
      this.x= x.x
      this.y= x.y

    } else {
      this.x= x;
      this.y= y;
    }
  }

  add( other ) {
    return new Vector( this.x + other.x, this.y + other.y )
  }

  sub( other ) {
    return new Vector( this.x - other.x, this.y - other.y )
  }
  
  scale( a ) {
    return new Vector( this.x* a, this.y* a )
  }

  dot( other ) {
    return this.x* other.x+ this.y* other.y
  }

  lengthSquared() {
    return this.dot( this );
  }

  length() {
    return Math.sqrt( this.dot( this ) )
  }

  distanceToSquared( other ) {
    return this.sub( other ).lengthSquared()
  }

  unit() {
    const length= this.length()
    return new Vector( this.x / length, this.y / length )
  }
}
