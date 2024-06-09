import { abstractMethod } from "../public/util.js"

/**
 * Abstract base class for cat AI brains. Can be initialized once,
 * and updated every cycle with the current entity position to compute
 * a new one.
 */
export class Brain {
  init() { abstractMethod() }
  update() { abstractMethod() }
}


