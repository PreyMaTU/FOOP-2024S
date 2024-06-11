note
  description: "Position wrapper to handle coordinates on playing field"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date$"
  revision: "$Revision$"


class
  POSITION

create
  make

feature
  pos_x: INTEGER
  pos_y: INTEGER

  make (x, y: INTEGER)
  -- simple position wrapper to treat coordinates as objects
    do
      pos_x := x
      pos_y := y
    end

  check_nearby (pos: POSITION): BOOLEAN
  -- verifies if POSITION is in the 2-tile-neighborhood of THIS position
    local
      -- delta offsets between near & pos
      dx: INTEGER
      dy: INTEGER
    do
      dx := pos.pos_x - pos_x
      dy := pos.pos_y - pos_y

      if dx.abs <= 2 and dy.abs <= 2 then
        Result := true
      end
    end

  check_position (pos: POSITION): BOOLEAN
    -- compares if two positions share the exact same coordinates
    do
      Result := pos.pos_x = pos_x and pos.pos_y = pos_y
    end

  get_x: INTEGER
  -- X-Coordinate Getter
    do
      Result := pos_x
    end

  get_y: INTEGER
  -- Y-Coordinate Getter
    do 
      Result := pos_y
    end
end
