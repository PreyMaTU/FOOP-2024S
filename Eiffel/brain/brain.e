note
  description: "Abstract class for cat AI which defines the next move the cat should take"
  author: "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date$"
  revision: "$Revision$"

-- abstract base class for AI-strategies
deferred class
  BRAIN

feature
  find_next_move (old_pos, target: POSITION): POSITION
  -- given own and target position, compute next move to take
    require
      non_void_input: old_pos /= Void and then target /= Void
    deferred -- abstract, must be implemented when INHERITed
    end -- find_next_move
end -- BRAIN
