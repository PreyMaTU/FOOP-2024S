note
  description: "Super-class to handle character position etc."
  author: "Stephan Stöger"
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
    end
 
  update_x (x: INTEGER)
    require
      x_pre_inbounds: x > 0 and then x <= square_len
      pre_single_x_move: (x - pos_x).abs <= 1
    do
      pos_x := x
    ensure
      x_updated: pos_x = x
      x_post_inbounds: pos_x > 0 and then pos_x <= square_len
    end

  update_y (y: INTEGER)
    require
      y_pre_inbounds: y > 0 and then y <= square_len
      pre_single_y_move: (y - pos_y).abs <= 1
    do
      pos_y := y
    ensure
      y_updated: pos_y = y
      y_post_inbound: pos_y > 0 and then pos_y <= square_len
    end

  compare_position_equal (pos: POSITION): BOOLEAN
    require
      non_void: pos /= Void
    do
      Result := get_pos.check_position (pos)
    end

  get_pos: POSITION
    do
      create Result.make (pos_x, pos_y)
    end

feature {GAMEBOARD}
  set_pos (pos: POSITION)
    require
      non_void: pos /= Void
    do
      pos_x := pos.pos_x
      pos_y := pos.pos_y
    end
end