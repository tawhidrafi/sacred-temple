# Layout v4

Layout system for tasteskill 2.5. Defines heights, edges, heroes, and type.

## Section 1: Heights and edges

- Hero fills the first screen alone at every width
- Equal left and right content edges
- One section per screen: 1 or 2 screens tall at 1440x900
- No second section heading peeking into the first section's tile

## Section 2: Screens per section

- Most sections: 1 or 2 screens tall
- Photo-chapters section: 3 or 4 screens (set by the moment)
- Section height determined by content height

## Container

- `.wrap` class centers content with equal left/right edges
- Grid columns define the layout structure
- Nothing out to one side, no sideways scroll
