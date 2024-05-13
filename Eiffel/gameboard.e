note
  description: "Gameboard controller class for Cat & Mouse game"
  author: "Stephan Stöger"
  date: "$Date$"
  revision: "$Revision$"


class
  GAMEBOARD

create
  make

feature {NONE}
  subways: ARRAYED_LIST[SUBWAY]
  cats: ARRAYED_LIST[CAT]
  mice: MOUSE -- cant be named `mouse` because class is already named `mouse` :)
  field_size: INTEGER
  random: RNG
  constants: CONSTANTS

  make (sub_count, cat_count: INTEGER)
    require
      non_zero_subs: sub_count > 0
      non_zero_cats: cat_count > 0
    local
      idx: INTEGER
      tmp_cat: CAT
    do
      create constants
      field_size := constants.MAPSIZE
      create random.make
      create subways.make (sub_count)
      
      -- generate `sub_count` subways with 2-3 exits each
      from
        idx := sub_count
      until
        idx <= 0
      loop
        subways.extend (default_subway)
        idx := idx - 1
      end

      -- initialize characters (must be done here to enable `agent` calls...)
      create cats.make (cat_count)
      create mice.init (field_size)
      
      -- generate cats on random positions
      from
      until
        cats.count = cat_count
      loop
        tmp_cat := default_cat
        if not cats.there_exists (agent check_cats_vicinity (?, tmp_cat.get_pos)) and not mice.get_pos.check_nearby (tmp_cat.get_pos) then
          cats.extend (tmp_cat)
        end
      end

      generate_subconnections
    end

  default_subway: SUBWAY
    do
      create Result.make
    end -- default_subway

  collision_check (pos: POSITION; ignore_mice: BOOLEAN): BOOLEAN
    local
      collision: BOOLEAN
    do
      collision := false
      if not ignore_mice then
        collision := mice.get_pos.check_nearby (pos)
      end

      if not collision then
        collision := cats.there_exists (agent check_cats (?, pos))
      end

      Result := collision
    end -- collision_check

  default_cat: CAT
    local
      -- brain: LAST_POSITION_BRAIN
      brain: NULL_BRAIN
    do
      create brain.make (random.get_next \\ 4 + 1)
      create Result.init (field_size, brain)
    end -- default_cat

  generate_subconnections
    -- randomly assigns exits to subways
    -- does not generate paths between exits
    local
      test_pos: POSITION
      tmp_x: INTEGER
      tmp_y: INTEGER
      tmp_exits: ARRAYED_LIST[POSITION]
      multi_used: BOOLEAN
      rng_choice: INTEGER
      exit_count: INTEGER
    do
      multi_used := false
      across subways as sub loop
        exit_count := 2

        if not multi_used then
          -- randomly pick one to have multiple exits
          rng_choice := random.get_next \\ 10
          if rng_choice < 2 then
            multi_used := true
            exit_count := 3
          end
        end

        create tmp_exits.make (exit_count)

        -- generate 2-3 exits per subway
        from
        until
          exit_count = 0
        loop
          -- generate positions until suitable is found
          -- suitable means that no other exit is in its vicinity
          from
            tmp_x := get_random_pos + 1
            tmp_y := get_random_pos + 1
            test_pos := create_position (tmp_x, tmp_y)
          until
            not subway_nearby (test_pos)
          loop
            tmp_x := get_random_pos + 1
            tmp_y := get_random_pos + 1
            test_pos := create_position (tmp_x, tmp_y)
          end

          sub.item.add_exit (test_pos)
          exit_count := exit_count - 1
        end -- across exits loop
      end -- across subways loop

      rng_choice := (random.get_next \\ subways.count) + 1
      subways [rng_choice].set_goal
    end -- generate_subconnections

  subway_nearby (pos: POSITION): BOOLEAN
    -- verifies if there's already an exit in the vicinity of pos
    -- checks distance 2 surrounding pos
    local
      nearby_hit: BOOLEAN
    do
      nearby_hit := false
      across subways as sub loop
        if sub.item.check_exit_position_nearby (pos) then
          nearby_hit := true
        end
      end
      Result := nearby_hit
    end -- subway_nearby

  get_random_pos: INTEGER
    do
      Result := random.get_next \\ field_size
    end -- get_random_pos

  create_position (x, y: INTEGER): POSITION
    do
      create Result.make (x,y)
    end -- create_position

  -- collision check helpers
  check_cats (cat: CAT; pos: POSITION): BOOLEAN
    do
      Result := pos_check (cat.get_pos, pos)
    end

  check_cats_vicinity (cat: CAT; pos: POSITION): BOOLEAN
    do
      Result := cat.get_pos.check_nearby (pos)
    end

  check_mice (mouse: MOUSE; pos: POSITION): BOOLEAN
    do
      Result := pos_check (mouse.get_pos, pos)
    end

  check_subs (sub: SUBWAY; pos: POSITION): BOOLEAN
    do
      Result := sub.check_exit_at_pos (pos)
    end

  pos_check (item, pos: POSITION): BOOLEAN
    do
      Result := item.check_position (pos)
    end

feature {GAME}
  print_board
    local
      x_idx: INTEGER
      y_idx: INTEGER
      test_pos: POSITION
      ignore_var: BOOLEAN
    do
      -- player should have been moved by now (happens off-cycle when input is received)
      -- next, move cats
      across cats as c loop
        test_pos := c.item.perform_move (mice.get_pos)
        if not collision_check (test_pos, true) then
          c.item.set_pos (test_pos)
        end
      end

      -- trigger "kill" evaluation on updated cats
      ignore_var := handle_mouse_position_change (mice.get_pos)

      from
        y_idx := 0
      until
        y_idx > field_size + 1
      loop
        from
          x_idx := 0
        until
          x_idx > field_size + 1
        loop
          test_pos := create_position (x_idx, y_idx)

          if x_idx = 0 or y_idx = 0 or x_idx = field_size + 1 or y_idx = field_size + 1 then
            -- print gameboard border
            Io.put_string ("🟨")
          elseif not mice.is_in_tunnel and cats.there_exists (agent check_cats (?, test_pos)) then
            -- print cats
            Io.put_string ("😼")
          elseif mice.is_alive and mice.compare_position_equal (test_pos) then
            -- print mouse
            Io.put_string ("🐭")
          elseif subways.there_exists (agent check_subs (?, test_pos)) then
            -- print subway entry
            Io.put_string ("🚪")
          else
            -- print "background"
            Io.put_string ("⬛️")
          end

          x_idx := x_idx + 1
        end -- across X-axis loop
        Io.new_line
        y_idx := y_idx + 1
      end -- across Y-axis loop
    end -- print_board

  handle_mouse_position_change (new_pos: POSITION): BOOLEAN
    -- tests for collision between mouse and cat leading to death of mouse
    -- as well as if new_pos is atop subway exit to potentially enter.
    -- if it is atop an exit, this method returns true
    do
      if cats.there_exists (agent check_cats (?, new_pos)) then
        mice.kill
        Result := false
      end
      
      if subways.there_exists (agent check_subs (?, new_pos)) then
        Result := true
      end
    end

  handle_player_move (direction: INTEGER)
    local
      valid: BOOLEAN
    do
      valid := true

      if direction = constants.MOVE_UP then
        if mice.pos_y - 1 >= 1 then
          mice.update_y (mice.pos_y - 1)
        end
      elseif direction = constants.MOVE_RIGHT then
        if mice.pos_x + 1 <= field_size then
          mice.update_x (mice.pos_x + 1)
        end
      elseif direction = constants.MOVE_LEFT then
        if mice.pos_x - 1 >= 1 then
          mice.update_x (mice.pos_x - 1)
        end
      elseif direction = constants.MOVE_DOWN then
        if mice.pos_y + 1 <= field_size then
          mice.update_y (mice.pos_y + 1)
        end
      else
        -- do nothing
        valid := false
      end
      
      if valid then
        valid := handle_mouse_position_change (mice.get_pos)
      end
    end

  is_mouse_alive: BOOLEAN
    do
      Result := mice.is_alive
    end

  check_and_enter_subway: BOOLEAN
    do
      across subways as s loop
        if s.item.check_exit_at_pos (mice.get_pos) then
          if s.item.check_is_goal then
            -- WIN!
            Result := true
          else
            -- teleport to next/other exit
            mice.set_pos (s.item.teleport (mice.get_pos))
            Result := false
          end -- if goal else teleport
        end -- if item.check_exit_at_pos
      end -- across subways
    end -- check_and_enter_subway
end -- GAMEBOARD
