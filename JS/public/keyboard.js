
export class Keyboard {
  #heldKeys

  constructor() {
    this.#heldKeys= new Set()

    document.addEventListener('keydown', e => this.#onKeyDown(e) )
    document.addEventListener('keyup', e => this.#onKeyUp(e) )
  }

  #onKeyDown( e ) {
    this.#heldKeys.add( e.shiftKey ? e.key.toLowerCase() : e.key )
  }

  #onKeyUp( e ) {
    this.#heldKeys.delete( e.key )
  }

  keyIsDown( key ) {
    return this.#heldKeys.has( key )
  }
}
