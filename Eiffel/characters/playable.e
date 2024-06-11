note
  description: "Super-class to handle movable characters with a unified interface"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date$"
  revision: "$Revision$"


class
  PLAYABLE

create 
  make

feature
  rng: RNG
  square_len: INTEGER
  pos_x: INTEGER
  pos_y: INTEGER

  make (field_size: INTEGER)
    require
      non_zero_fieldsize: field_size > 0
    do
      square_len := field_size
      create rng.make
      pos_x := (rng.get_next \\ field_size) + 1
      pos_y := (rng.get_next \\ field_size) + 1
    end -- make
 
  update_x (x: INTEGER)
  -- safe and secure way to update X-Coordinate while ensuring it's a legal move
    require
      x_pre_inbounds: x > 0 and then x <= square_len
      pre_single_x_move: (x - pos_x).abs <= 1
    do
      pos_x := x
    ensure
      x_updated: pos_x = x
      x_post_inbounds: pos_x > 0 and then pos_x <= square_len
    end -- update_x

  update_y (y: INTEGER)
  -- safe and secure way to update Y-Coordinate while ensuring it's a legal move
    require
      y_pre_inbounds: y > 0 and then y <= square_len
      pre_single_y_move: (y - pos_y).abs <= 1
    do
      pos_y := y
    ensure
      y_updated: pos_y = y
      y_post_inbound: pos_y > 0 and then pos_y <= square_len
    end -- update_y

  compare_position_equal (pos: POSITION): BOOLEAN
  -- compare THIS position with OTHER position
    require
      non_void: pos /= Void
    do
      Result := get_pos.check_position (pos)
    end -- compare_position_equal

  get_pos: POSITION
  -- Position GETTER (convert coordinates to Position)
    do
      create Result.make (pos_x, pos_y)
    end -- get_pos

feature {GAMEBOARD}
  set_pos (pos: POSITION)
  -- update position of current Playable (... because teleporting can't use `update_...` methods)
    require
      non_void: pos /= Void
    do
      pos_x := pos.pos_x
      pos_y := pos.pos_y
    end -- set_pos
end -- PLAYABLE
