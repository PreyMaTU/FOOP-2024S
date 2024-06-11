note 
  description:  "Subway with multiple exits that mice can go into"
  author:       "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date:         "$Date$"
  revision:     "$Revision$"


class
  SUBWAY

create
  make

feature {NONE}
  exits: LINKED_LIST [POSITION]
  path: ARRAY[POSITION]
  is_goal: BOOLEAN

  make
  -- default initialize
    do
      is_goal := false
      create exits.make
      create path.make_empty
    end

feature {GAMEBOARD}
-- only GAMEBOARD class is allowed to interact with subways
  add_exit (exit: POSITION)
    -- add single non-void exit to this system's exits
    require
      non_void_param: exit /= Void
    do
      exits.extend (exit)
    ensure
      one_was_added: exits.count = old exits.count + 1
    end

  set_goal
  -- helper to designate this subway as the goal (win condition)
    do
      is_goal := true
    end

  check_is_goal: BOOLEAN
  -- win-condition-check helper
    do
      Result := is_goal
    end

  check_exit_position_nearby (pos: POSITION): BOOLEAN
  -- helper to verify if there is a subway exit near provided position
  -- used mainly for generating gameboard to ensure that exits don't clog up in one region of the map
    do
      Result := false
      across exits as e loop
        if e.item.check_nearby (pos) then
          Result := true
        end
      end
    end
  
  check_exit_at_pos (pos: POSITION): BOOLEAN
  -- verifies if there is an exit directly at the provided position
  -- used to verify if player has found a subway to potentially enter
    do
      Result := false
      across exits as e loop
        if e.item.check_position (pos) then
          Result := true
        end
      end
    end

  teleport (old_pos: POSITION): POSITION
  -- facilitate Eiffel-catnmouse's own version of "moving inside a tunnel": Teleportation!
  -- allows arbitrary amount of exits to teleport between
  -- currently in its simplest form simply takes the next (index-based) exit
    local
      idx: INTEGER
    do
      idx := 0
      across exits as e loop
        if e.item.check_position (old_pos) then
          idx := e.cursor_index
        end
      end

      Result := exits[(idx \\ exits.count) + 1]
    end
end
