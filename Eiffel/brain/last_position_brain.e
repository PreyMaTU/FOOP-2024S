note
  description: "Simple cat AI brain implementation that allows Cat to track the mouse's last known position"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date$"
  revision: "$Revision$"


class
  LAST_POSITION_BRAIN

inherit
  BRAIN

create
  make

feature {NONE}
  sleep_count: INTEGER
  sleep_factor: INTEGER
  random: RNG
  
  make (factor: INTEGER)
    do
      create random.make
      sleep_factor := factor
      sleep_count := 0
    end -- make

feature
  find_next_move (cat_pos, target_pos: POSITION): POSITION
    -- calculates directional vector towards target
    -- picks (locally) "best" move to reach target
    local
      dx: INTEGER
      dy: INTEGER
    do
      if sleep_count = 0 and random.get_next \\ 15 <= 3 then
        sleep_count := sleep_factor
      end

      if sleep_count > 0 then
        -- cat not awake yet
        sleep_count := sleep_count - 1
        Result := cat_pos
      else
        dx := cat_pos.pos_x - target_pos.pos_x
        dy := cat_pos.pos_y - target_pos.pos_y

        if dx = 0 and dy = 0 then
          -- target met, don't move
          Result := cat_pos
        elseif dx = 0 and dy > 0 then
          -- target directly above
          create Result.make (cat_pos.pos_x, cat_pos.pos_y - 1)
        elseif dx = 0 and dy < 0 then
          -- target directly below
          create Result.make (cat_pos.pos_x, cat_pos.pos_y + 1)
        elseif dx > 0 and dy = 0 then
          -- target directly to the left
          create Result.make (cat_pos.pos_x - 1, cat_pos.pos_y)
        elseif dx < 0 and dy = 0 then
          -- target directly to the right
          create Result.make (cat_pos.pos_x + 1, cat_pos.pos_y)
        elseif dx > 0 and dy > 0 then
          -- target is towards top-left
          if dx > dy then
            -- move sideways
            create Result.make (cat_pos.pos_x - 1, cat_pos.pos_y)
          else
            -- move up
            create Result.make (cat_pos.pos_x, cat_pos.pos_y - 1)
          end
        elseif dx < 0 and dy > 0 then
          -- target is towards top-right
          if dx.abs > dy then
            create Result.make (cat_pos.pos_x + 1, cat_pos.pos_y)
          else
            create Result.make (cat_pos.pos_x, cat_pos.pos_y - 1)
          end
        elseif dx > 0 and dy < 0 then
          -- target is towards bottom-left
          if dx > dy.abs then
            create Result.make (cat_pos.pos_x - 1, cat_pos.pos_y)
          else
            create Result.make (cat_pos.pos_x, cat_pos.pos_y + 1)
          end
        elseif dx < 0 and dy < 0 then
          -- target is towards bottom-right
          if dx.abs > dy.abs then
            create Result.make (cat_pos.pos_x + 1, cat_pos.pos_y)
          else
            create Result.make (cat_pos.pos_x, cat_pos.pos_y + 1)
          end
        else
          -- illegal move
          -- should not happen but nobody would want an exception!
          -- CAT will surely find its way back
          create Result.make (-1, -1)
        end -- if-elseif-else
      end -- ENDIF !sleeping
    end -- find_next_move
end -- LAST_POSITION_BRAIN
