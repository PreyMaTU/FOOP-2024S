note
  description:  "Cat of the game (AI)"
  author:       "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date:         "$Date$"
  revision:     "$Revision$"


class
  CAT

inherit
  PLAYABLE

create
  init

feature {NONE}
  strategy: BRAIN

  init (field_size: INTEGER; brain: BRAIN)
    do
      strategy := brain
      make (field_size) -- initialize superclass
    end -- init

feature
  perform_move (target: POSITION): POSITION
  -- let AI find it's next move based on assigned strategy, own position and target position
    do
      Result := strategy.find_next_move (get_pos, target)
    end -- perform_move
end -- CAT
