note
  description: "Game class for the Cat & Mouse game that controls the game board"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date$"
  revision: "$Revision$"


class
  GAME

create
  make

feature {NONE}
  board: GAMEBOARD
  constants: CONSTANTS

  make
    do
      create constants
      create board.make (3, 2)
    end -- make

feature
  print_board
  -- print current state of gameboard to screen
    do
      board.print_board
    end -- print_board

  verify_player: BOOLEAN
  -- helper to check if player is still alive or has been eaten by catte
    do
      Result := board.is_mouse_alive
    end -- verify_player

  move_left
  -- move left one tile
    do
      board.handle_player_move (constants.MOVE_LEFT)
    end -- move_left

  move_right
  -- move right one tile
    do
      board.handle_player_move (constants.MOVE_RIGHT)
    end -- move_right

  move_up
  -- move up one tile
    do
      board.handle_player_move (constants.MOVE_UP)
    end -- move_up

  move_down
  -- move down one tile
    do
      board.handle_player_move (constants.MOVE_DOWN)
    end -- move_down

  try_enter_subway: BOOLEAN
  -- attempts to enter subway at player's current position
  -- does nothing if there is no subway
  -- if there is a subway, verifies if it was the GOAL subway and returns true if it is
    do
      Result := board.check_and_enter_subway
    end -- try_enter_subway
end -- GAME
