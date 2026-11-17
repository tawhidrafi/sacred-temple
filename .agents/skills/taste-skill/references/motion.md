# Motion

Hero entrance, hover, press, focus, nav, tabs, card loops.

## Hero entrance

Every hero enters once on load (`data-enter`).

## Hover micro-animations

- Linked card lifts 2px
- Photo zooms 1.02-1.03 inside its frame
- Buttons step on hover and press on click
- Underlines draw
- Card loops cycle in 2.5-4s, repeat and restart on hover

## Rules

- No tilt, carousels, or timed tabs
- Every page carries one dealt moment, two on a long page
- Nothing moves because the page scrolled (except dealt moment in its own section, or big scene on tech)
- Anything moving past 5s has a pause button
- Under reduced motion: everything rests, nothing stays hidden
- At most four live WebGL contexts
