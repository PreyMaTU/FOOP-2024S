note
  description: "Utility class for pseudo-random number generator"
  author:      "Stephan Stöger, Philipp Vanek, Matthias Preymann"
  date: "$Date"
  revision: "$Revision$"


class
  RNG

create
  make

feature {NONE}
  randgen: RANDOM

  -- FROM: https://www.eiffel.org/article/random_numbers
  -- basic initialization of PRNG
  make
    local
      l_time: TIME
      l_seed: INTEGER
    do
      -- This computes milliseconds since midnight.
      -- Milliseconds since 1970 would be even better.
      create l_time.make_now
      l_seed := l_time.hour
      l_seed := l_seed * 60 + l_time.minute
      l_seed := l_seed * 60 + l_time.second
      l_seed := l_seed * 1000 + l_time.milli_second
      create randgen.set_seed (l_seed)
    end

feature
  get_next: INTEGER
    -- generates next Pseudo random number and returns it
    local
      skip: INTEGER
    do
      skip := 0
      randgen.forth
      from
        skip := randgen.item \\ 5
      until
        skip <= 0
      loop
        randgen.forth
        skip := skip - 1
      end
      Result := randgen.item
    end
end
