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
  do
    Io.new_line
    Io.put_string (chars)
    Io.new_line
  end

  make -- run application
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
      create terminal.make
      create game.make
      create start_time.make_now

      win := false

      from
      until
        exit
      loop
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
            if game.try_enter_subway then
              win := true
              exit := true
            end
          when 'q' then
            exit := True
          else
        end

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
        end

        if seconds >= game_clock then
          fprint ("Timed out, better luck next time...")
          exit := true
        end

        sleep (1000 * 1000 * 500)
      end -- game loop
    end -- make
end -- APPLICATION
