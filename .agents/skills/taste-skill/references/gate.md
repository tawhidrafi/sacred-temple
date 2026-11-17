# Gate

Finish gate for tasteskill pages. Runs copy-lint, consistency.mjs, check.mjs, shoot.mjs, perf.mjs.

## Gate states

- GATE: PASS — all checks pass
- GATE: OPEN — waivers in place, page can proceed
- GATE: DONE — user accepted open FAILs
- GATE: SETUP — no page yet, arm the gate first
- GATE: ERROR — checks could not run
- GATE: OFF — gate disabled

## Procedure

Run gate.mjs until the last line is GATE: PASS or GATE: OPEN (3 rounds max). Fix what it lists and rerun.

## Waivers

FAILs judged false are waived in `.taste-skill/waivers.json` with reason.
