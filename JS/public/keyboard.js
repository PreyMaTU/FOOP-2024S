
/**
 * Represents the current state of the keyboard. Gets
 * fed events from the browser window and makes them
 * queryable by the UI and controllable entities.
 */
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

  // Clears pressed keys every frame
  frame() {
    this.#frameKeys.clear()
  }

  // Check if a key is currently held down
  keyIsDown( key ) {
    return this.#heldKeys.has( key )
  }

  // Check if a key was pressed since last frame
  keyWasPressed( key ) {
    return this.#frameKeys.has( key )
  }
}
