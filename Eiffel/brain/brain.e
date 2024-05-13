note
  description: "Abstract class for cat AI which defines the next move the cat should take"
  author: "Stephan Stöger"
  date: "$Date$"
  revision: "$Revision$"

deferred class
  BRAIN

feature
  find_next_move (old_pos, target: POSITION): POSITION
    require
      non_void_input: old_pos /= Void and then target /= Void
    deferred
    end -- find_next_move
end -- BRAIN