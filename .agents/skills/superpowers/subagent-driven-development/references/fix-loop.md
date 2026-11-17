# Fix Loop

Read this before every fix-loop round, even if you read it earlier in this session.

## When it triggers

The loop triggers when the review reports:
- Spec ❌ (spec compliance failure)
- Any Critical or Important finding
- A ⚠️ item you confirmed as a real gap

## Round cap

Maximum 5 rounds. Past the cap, rounds don't converge — the failure is structural. Adjudicate and route.

## Breaker

If rounds 4-5 don't resolve the issue, stop the loop. Park remaining findings with rulings and move on.

## Ledger line per round

Each round writes:
`Task <N>: Fix round <K> — <finding> — <what was fixed> — <test RED→GREEN>`

## Output

Fixed findings or parked findings with rulings. Never silent discards.
