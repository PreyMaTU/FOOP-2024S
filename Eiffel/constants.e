note
  description: "Constants to use in multiple places"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date$"
  revision: "$Revision$"

class
  CONSTANTS

feature
  -- simplistic use of a class to mimic Java Interface / Enum behaviour
  MAPSIZE: INTEGER = 15

  MOVE_UP:    INTEGER = 1
  MOVE_DOWN:  INTEGER = 2
  MOVE_LEFT:  INTEGER = 3
  MOVE_RIGHT: INTEGER = 4
end -- CONSTANTS
