note
  description:  "Class used to interface with commandline"
  author:       "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date:         "$Date$"
  revision:     "$Revision$"


class
  CLI

create
  make

feature {NONE}
  make
    -- perform CLI configuration
    do
      set_term_raw
      set_non_blocking
    end -- make
  
  set_non_blocking
    -- disable blocking behaviour for `getchar()`
    -- preserves existing flags only adding `O_NONBLOCK` flag for STDIN
    external
      "C inline use <fcntl.h>, <stdio.h>"
    alias           
      "{
        int flags = fcntl(STDIN_FILENO, F_GETFL, 0);
        fcntl(STDIN_FILENO, F_SETFL, flags | O_NONBLOCK);
      }"
    end -- set_non_blocking
  
  set_term_raw
    -- configures terminal for game-use
    -- thus:
    --  > disables echoing of user-input
    --  > disables canonical mode, allowing to read single bytes instead of lines (which would require newline/Enter)
    --  > configures `read` to return single-bytes as well as a polling interval of 100ms
    -- see https://viewsourcecode.org/snaptoken/kilo/02.enteringRawMode.html
    external
      "C inline use <termios.h>, <stdio.h>"
    alias
      "{
        struct termios raw;
        tcgetattr(STDIN_FILENO, &raw);
        raw.c_lflag &= ~(ECHO | ICANON);
        raw.c_cc[VTIME] = 1;
        raw.c_cc[VMIN] = 0;
        tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw);
      }"
    end -- set_term_raw

feature
  read_move : CHARACTER
    -- read single character keyboard input from stdin and returns it
    external
      "C inline use <unistd.h>, <stdio.h>"
    alias
      "{
        char cur, last = 0x00;
        while (read(STDIN_FILENO, &cur, 1) > 0 && cur != '\n') {
          last = cur;
        }
        return last;
      }"
    end -- read_move
end -- CLI
