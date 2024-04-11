
export function abstractMethod() {
  throw Error('Abstract Method');
}

export class Vector {
  constructor( x, y ) {
    if( Array.isArray(x) ) {
      this.x= x[0]
      this.y= x[1]
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
}
