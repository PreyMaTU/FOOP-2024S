
export class Keyboard {
  #heldKeys
  #frameKeys

  constructor() {
    /** @type {Set<string>} */
    this.#heldKeys= new Set()

    /** @type {Set<string>} */
    this.#frameKeys= new Set()

    document.addEventListener('keydown', e => this.#onKeyDown(e) )
    document.addEventListener('keyup', e => this.#onKeyUp(e) )
  }

  #onKeyDown( e ) {
    const name= e.key.length === 1 ? e.key.toLowerCase() : e.key
    this.#heldKeys.add( name )
    this.#frameKeys.add( name )
  }

  #onKeyUp( e ) {
    this.#heldKeys.delete( e.key.length === 1 ? e.key.toLowerCase() : e.key )
  }

  frame() {
    this.#frameKeys.clear()
  }

  keyIsDown( key ) {
    return this.#heldKeys.has( key )
  }

  keyWasPressed( key ) {
    return this.#frameKeys.has( key )
  }
}
