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
      make (field_size)
    end -- init

feature
  perform_move (target: POSITION): POSITION
    do
      Result := strategy.find_next_move (get_pos, target)
    end -- perform_move
end -- CAT
