
# FOOP 2024S

## Implementations
The game is implemented three times in different Object Oriented Programming Languages.

- JavaScript
- SmallTalk
- Eiffel

However, there are differences between the implementations: As the main point of the exercise
was to get familiar with SmallTalk and Eiffel which are very uncommon and somewhat esoteric
languages, only simplified versions of the game had to be made.

### JavaScript
The first version of the game is implemented using JavaScript (ECMA-Script 2022) and HTML 5
for the clients, and NodeJS for the server. To run the game run the following commands:

```bash
cd JS
npm i
node .
```

Then open a browser tab and navigate to `localhost:3000`.

The sitting versions of the sprites are modified versions of pixel art we found online. The walking versions are made by us.

### SmallTalk
The second version of the game is simplified and is implemented using SmallTalk and Morphic. 
Compared to the JS version there is only a single player mode and one cat that chases the
player. To run the game, you need to first acquire [Squeak](https://squeak.org/downloads/) and
start it.

Then open the "Tools" drop down on top of the desktop and click "File List" (at the very
bottom of the list). In the explorer window navigate to the folder `/ST`. Select the `game.st`
file and click the "filein" button. Now the game code is loaded. Finally, again in the "Tools"
drop down click "Workspace". Here type the following command:

```
Game create.
```

With the cursor remaining in the same line as the above command press `Ctrl`+`D` (`Cmd`+`D`).
The game's window should now be visible.


### Eiffel
The third version of the game is written in Eiffel. For project setup and build instructions see
the `ReadMe` file in the `Eiffel` directory.

This version of the game is also single player, but now there is also only a single enemy cat.
Furthermore, the game was implemented as a pure command line game, which displays the map using
emoji characters.

## Group "P"
This project is worked on by the following team members:

- Stephan Stöger
- Matthias Preymann
- Philipp Vanek
  
## Mockups

These are mockups we made with the power of MS Paint to guide the development of the JS version of the game. We mostly adhered to the designs but did not recreate them 100%.

### Playing field
![Mockup of the playing field](./assets/playing-field.png)
![Mockup of the playing field when entering a subway tunnel](./assets/inside-tunnel.png)

### Various menu screens
![Mockup of the voting menu](./assets/menu-voting.png)
![Mockup of the controls menu](./assets/menu-controls.png)
![Mockup of the pause menu](./assets/menu-paused.png)

## Game Description
Taken from the exercise sheet written by Prof. Puntigam:

A rectangular playing field contains several subways (not connected with each other) where mice are safe from being caught by
cats staying at the surface. Each subway has several exits to the
surface. Mice in subways can move without being seen by cats, and
cats can move on the surface without being seen by mice in subways. A mouse in a subway sees other mice in the same subway, but
not mice in other subways. Cats and mice on the surface see each
other, and cats try to catch mice that show up at the surface. Each
mouse knows all subways and their exits, but cats see only exits and
do not know how they are connected by subways. When a mouse
safely enters a subway, it informs other mice in this subway about
positions of cats at the time of entering. Initially, mice are located
in arbitrary (when possible different) subways and cats somewhere
on the surface. All mice want to meet in one subway, but it is not
predetermined in which one. Mice in the same subway can coordinate themselves by voting for a specific subway to meet, seeing the
votes of other mice in the same subway and adapting their votes until there is an agreement. But, mice in one subway cannot see votes
of mice in other subways. To distribute information and to meet,
some mice must move to other subways, but thereby they have to
cover a distance at the surface. Every stay at the surface is risky for
mice, the longer the more dangerous. A game ends when all surviving mice are in the same subway (in this case the surviving mice are
the winners) or after a predefined amount of time (no mouse wins
because the aim of meeting all others was not achieved).

Each player (real person) controls a mouse. Cats that try to
catch mice are controlled by computer algorithms (not necessarily
each cat by the same algorithm). To make the game more interesting, there can also be mice controlled by computer algorithms,
but that is not absolutely necessary. Each player uses his or her own
computer connected to a network. It must be possible that at least 4
players on 4 different computers participate in the same game. The
communication between the computers shall be efficient enough to
avoid noticeable delays for the largest possible playing field (with
reasonable resolution on the available screen size).

## Theory Questions

Some of these questions do not ask for hard facts, but required us to argue our own opinion after engaging with the different technologies. Therefore, the following points might not align with your own experiences and opinions.

### Task 1 - JS
_Which number and forms of subways, number of exits, number and strategies of cats (as well as mice controlled by computer algorithms), playing time, mechanisms of controlling mice, etc., provide the most exciting gaming experience? Which variations did you try out?_

For the project developing a cat and mouse game, we explored only a few different design elements to adjust the gaming experience, and focused mostly on functionality and stability. We experimented with different tunnel structures, finding that simpler designs with fewer than four portals worked better due to the small map size, adding to the challenge by reducing the likelihood of all mice ending up in the same tunnel. Longer tunnels decreased difficulty for mice, while shorter ones made the game more challenging. Multiple exits turned out to enhance the game by providing various escape routes, increasing excitement and unpredictability.
We also tested different cat AIs to influence game dynamics. One AI targeted a specific player until caught, another followed a predefined path, and a third targeted the nearest player, adding flavor. These design choices — simpler tunnels, multiple exits, and dynamic cat behaviors — provided the most exciting and balanced gaming experience.

_Which playing strategy of mice is most promising (staying in a subway as long as possible, moving to another subway early, etc.)? Which strategies did you try out?_

We explored several strategies for the mice in our cat and mouse game. Initially, we tried having the mice stay in a subway tunnel for longer periods before moving, but this led to stalemates where time ran out without significant action. Another approach involved mice running between tunnels without coordinating with their peers, which proved ineffective as it lacked strategic planning. The most promising strategy, based on our experience, was for the mice to move swiftly between tunnels while ensuring they left enough time to vote on a specific tunnel color. This coordinated approach allowed all mice in a tunnel to move together, improving their chances of evading the cats and winning the game.

### Task 2 - SmallTalk
_Do you prefer to program in a dynamic or static language? Why?_

When it comes to choosing between dynamic and static languages, the preferred choice depends largely on the context and specific use case. Dynamic languages, such as JavaScript and Smalltalk, offer considerable flexibility and freedom during the design phase. They allow rapid development and extension of code, often requiring less upfront planning. This flexibility makes dynamic languages particularly suitable for smaller-scale applications, prototypes, and proof-of-concepts. The ability to make changes on the fly and adapt the codebase quickly is a significant advantage in these scenarios. However, the lack of stringent rules in the type system can sometimes lead to disorganization, as the ease of making unplanned extensions can result in a less coherent code structure.
On the other hand, static languages enforce a more disciplined approach to programming. Languages like Java and C++ require the programmer to plan ahead and consider the design more thoroughly from the outset. This upfront planning leads to cleaner, more maintainable code. Furthermore the available type information can provide more opportunities for optimization by the compiler. Additionally, static languages often document themselves better because the types of variables inherently describe their intended purpose and use. This can lead to greater confidence that the code functions correctly even without extensive testing. However, the increased rigidity and potential complexity of obtuse syntax in static languages can sometimes offset these benefits, making them less appealing for quick, iterative development cycles.
How important is the run-time penalty of an interpreted language like Smalltalk?

The run-time penalty of an interpreted language like Smalltalk can be quite significant, especially in contexts where performance is critical. For small, single-purpose scripts intended to automate basic tasks, the overhead introduced by interpretation may not be noticeable. However, for larger applications that require real-time operations or extensive user interactions, the execution speed can be a major concern. This is why substantial efforts have been made to enhance interpreters, such as implementing bytecode VMs and JIT compilers that generate the bytecode on startup. In many cases even more involved schemes are employed like in JS engines or the JVM where the bytecode gets turned into native machine code in a second JIT step. The amount of effort put into these systems suggests how important run time performance for interpreted languages can be. 

_Is the concept of “personal computing” (each person has its own customized system) still adequate? Are there any good alternatives?_

No, because only a small fraction of people is interested in customizing their system in a way that goes beyond aesthetics. Risk of rendering the whole system inoperable and losing work. In Depth knowledge of programming concepts and the specific system required, which is untypical for most users. Even for people who are able to, why reinvent the wheel, when software and extensions can be shared more easily via different means. Customizing is also very time consuming. At this point OSs are so complicated and feature rich, that it is untenable to do meaningful additions that require deep access into the underlying Kernel code, and in many cases not needed anymore with OSs providing most facilities a modern user needs. Furthermore with the shift to the web, the browser and web applications replace what smalltalk provides.

_How can team members cooperate when developing software together in Smalltalk?_

One way to cooperate when developing a program in Smalltalk is pair programming. Through Pair programming you don’t need to Split the work itself and manage different versions of your program in parallel. Pair programming leads to fewer bugs upfront as a second pair of eyes is responsible for reviewing the code in realtime. 

There are also VCS systems like ENVY that can be used to implement a rather typical way of collaborating when developing in Smalltalk. The integrated Git Tools that come with Squeak also did not work properly, even after playing around with them for some time.

Overall it was a rather awkward experience to develop Smalltalk in a team, as it feels rather backwards and old. We decided to stick to pair programming for this exercise.

_Which aspects of programming in Smalltalk do you like, which aspects don’t you like?_

- (+) every block is a closure, higher order functions/callbacks easy
- (+) extensive set of premade system classes
- (+) completely go through with the OO design and dynamic dispatch, including control flow structures
- (+) easy install
- (+) interesting way to name methods by interspersing names and parameters in the signature
- (+) syntax has a clean and readable look&feel without need for many separator/operator symbols (except for parenthesis!)


- (-) no traditional way for collaboration on source code level eg. via git
- (-) bad documentation (and seemingly a general lack of community engagement/participation/activity)
- (-) missing operator precedence
- (-) ambiguity when chaining method calls
- (-) bad or little error information when importing source code
- (-) single threaded-ness of the system → easily halts completely

### Task 3 - Eiffel
_How much work is it to specify useful assertions in Eiffel?_

Arguably it takes quite a lot of effort to make use of them properly, as it may require re-thinking the application’s design in order to apply them properly. For example in our application, `POSITION` class has various pre-/post-conditions to ensure that character moves can only be one cell at a time; this however prevents us from reusing these methods to facilitate the “teleport”-mechanic of the subways in this simplified approach, thus they are not 100% effective as improper teleports could still lead to problems (although the rest of the current design should actively prevent such from happening!).

To make effective use of pre/post-conditions as used by the design by contract principle, features (what methods are called in Eiffel) need to be categorized into functions and procedures. Functions are supposed to act as pure functional accessors that do not change the object or environment (no side effects). Procedures on the other hand mutate the object’s state and hence may not be used inside contract condition checks, and usually do not produce a result (return value). Based on this separation a common pattern in Eiffel emerges, where the object state is first mutated by a procedure, which can then be observed by calling a function. For example the file reader class has a procedure to consume the next line, which does not return anything, and another function to get the last read line, which can be called an unlimited number of times.

_How important is the run-time penalty of assertion checking?_

Very much, as it can be very slow → generally disabled in production (or made less strict)

Additionally, evaluating a feature’s constraints might involve calling other functions, which have constraints/conditions themselves. To prevent the risk of infinite recursion these secondary checks are always disabled.

_How is it possible to specify pre-conditions that are, in some sense, in the subtype stronger than in the supertype although Eiffel does not allow us to redefine pre-conditions to become stronger? How is it possible to specify post-conditions that are, in some sense, in a subtype weaker than in the supertype although Eiffel does not allow us to redefine post-conditions to become weaker? (Yes, it is possible, although not obvious, and with an appropriate interpretation it can be done without violating Design by Contract.)_

When using functions in the post- and precondition checks that are defined in the class, it is possible to change the strength of the conditions. A sub class can override the function and let it test a weaker or basically any condition. However, (based on Prof. Puntigam) this can still be fine as it is a question of perspective/interpretation. The sub class still full fills all condition, and just redefined the meaning of the function which still has to hold true.


_Eiffel supports co-variant input parameters. What are the advantages and disadvantages of this feature in practical programming?_

- (+) Covariant input parameters allow subtypes to also (greater flexibility)
- (+) improved type-safety in sub-classes
- (+) improved code-readability + maintainability


- (-) types not 100% replaceable, replacing sub-type with it’s supertype may cause errors handling the sub-typed parameter correctly
- (-) increased complexity regarding method overriding
- (-) potentially fragile code: change of super-type might cause sub-types to need modification to work as well

_Which features of Eiffel would you like to see also in your favorite programming language? Which features of Eiffel would you rather avoid to use?_

- (+) more fine grained control over method visibility to other classes
- (+) dynamic generation of objects via `Result.make`
- (+) simple, direct access to low-level APIs
- (+) platform independent compilation/build
- (+) exception-free code


- (-) (semi-)forced choice of IDE
- (-) (not a feature, but lack of documentation => more about the state of Eiffel as a whole)


## License
This project is licensed under the MIT license.
