note
  description:  "Mouse of the game (Player)"
  author:       "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date:         "$Date$"
  revision:     "$Revision$"


class
  MOUSE

inherit
  PLAYABLE

create
  init

feature {NONE}
  in_tunnel: BOOLEAN
  alive: BOOLEAN

  init (field_size: INTEGER)
    do
      in_tunnel := false
      alive := true
      make (field_size) -- initialize superclass
    end -- init

feature
  is_alive: BOOLEAN
  -- helper to verify cat's liveliness
    do
      Result := alive
    end -- is_alive

  is_in_tunnel: BOOLEAN
  -- helper to check if cat is in tunnel
    do
      Result := in_tunnel
    end -- is_in_tunnel

  kill
  -- helper to update mouse's liveliness
    do
      alive := false
    end -- kill
end -- MOUSE
