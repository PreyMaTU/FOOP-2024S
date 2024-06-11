note 
  description:  "Main class for Cat-n-mouse in Eiffel"
  author:       "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date:         "$Date$"
  revision:     "$Revision$"


class
  APPLICATION

-- needed for `sleep`
inherit 
	EXECUTION_ENVIRONMENT

create
  make

feature {NONE}
  game_clock:  INTEGER = 180

  fprint (chars: STRING)
  -- utility function to print strings along with a newline
  do
    Io.new_line
    Io.put_string (chars)
    Io.new_line
  end -- fprint

  make
  -- run game loop of application
    local
      terminal:   CLI
      game:       GAME
      char:       CHARACTER
      exit:       BOOLEAN
      win:        BOOLEAN
      start_time: TIME
      end_time:   TIME
      duration:   TIME_DURATION
      seconds:    INTEGER
    do
      -- configure terminal (CLI) for our purposes
      create terminal.make
      -- create gameboard
      create game.make
      -- timer to track time since game started
      create start_time.make_now

      win := false

      from
      until
        exit
      loop
        -- read user input from CLI
        char := terminal.read_move
        inspect char
          when 'a' then
            game.move_left
          when 'd' then
            game.move_right
          when 'w' then
            game.move_up
          when 's' then
            game.move_down
          when ' ' then
            -- slightly unfortunate naming ahead: if `enter_subway_and_test_goal` would be more fitting
            if game.try_enter_subway then
              win := true
              exit := true
            end
          when 'q' then
            exit := True
          else -- inspect-default
        end -- inspect char

        create end_time.make_now
        duration := end_time.relative_duration (start_time)
        seconds := duration.seconds_count

        print ("%/27/[1J")  -- erase screen
        Io.put_string ("Time left: ")
        Io.put_integer (game_clock - seconds)
        Io.new_line
        Io.new_line
        game.print_board

        if win then
          fprint ("You are a winner! 🎉 Well played!")
          exit := true
        elseif not game.verify_player then
          fprint ("You died! Better luck next time ...")
          exit := true
        end -- ELIF win

        if seconds >= game_clock then
          fprint ("Timed out! Better luck next time ...")
          exit := true
        end -- ELIF timeout

        -- effectively read & process user input every 500ms
        sleep (1000 * 1000 * 500)
      end -- game loop
    end -- make
end -- APPLICATION
