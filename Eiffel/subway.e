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
    do
      is_goal := false
      create exits.make
      create path.make_empty
    end

feature {GAMEBOARD}
  add_exit (exit: POSITION)
    require
      non_void_param: exit /= Void
    do
      exits.extend (exit)
    ensure
      one_was_added: exits.count = old exits.count + 1
    end

  set_path
    do

    end

  set_goal
    do
      is_goal := true
    end

  check_is_goal: BOOLEAN
    do
      Result := is_goal
    end

  check_exit_position_nearby (pos: POSITION): BOOLEAN
    do
      Result := false
      across exits as e loop
        if e.item.check_nearby (pos) then
          Result := true
        end
      end
    end
  
  check_exit_at_pos (pos: POSITION): BOOLEAN
    do
      Result := false
      across exits as e loop
        if e.item.check_position (pos) then
          Result := true
        end
      end
    end

  teleport (old_pos: POSITION): POSITION
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
