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
    end

feature
  print_board
    do
      board.print_board
    end

  verify_player: BOOLEAN
    do
      Result := board.is_mouse_alive
    end

  move_left
    do
      board.handle_player_move (constants.MOVE_LEFT)
    end

  move_right
    do
      board.handle_player_move (constants.MOVE_RIGHT)
    end

  move_up
    do
      board.handle_player_move (constants.MOVE_UP)
    end

  move_down
    do
      board.handle_player_move (constants.MOVE_DOWN)
    end

  try_enter_subway: BOOLEAN
    do
      Result := board.check_and_enter_subway
    end
end