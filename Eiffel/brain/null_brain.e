note
  description: "NULL Brain implementation for AI-cats. This implementation does nothing, cats using this are stationary"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"  
  date: "$Date$"
  revision: "$Revision$"

class
  NULL_BRAIN

inherit
  BRAIN

create
  make

feature {NONE}
  make (p: INTEGER)
    do
    end

feature
  find_next_move (self_pos, target: POSITION): POSITION
    -- null brain doesn't move
    do
      Result := self_pos
    end
end
