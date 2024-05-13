note
  description:  "Mouse of the game (Player)"
  author:       "Stephan Stöger"
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
      make (field_size)
    end

feature
  is_alive: BOOLEAN
    do
      Result := alive
    end

  is_in_tunnel: BOOLEAN
    do
      Result := in_tunnel
    end

  kill
    do
      alive := false
    end
end