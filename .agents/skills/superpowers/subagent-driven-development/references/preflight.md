# Pre-flight

Before dispatching Task 1, scan the plan for conflicts between tasks.

## Interface conflict scan

For every task that consumes what an earlier task produces, create one ledger row:
- The two tasks
- What one produces against what the other consumes
- What you found

Tasks that share nothing get no row. A plan whose tasks share nothing gets the single line:
`Pre-flight: no shared interfaces`

Rule on each conflict with the spec as the binding authority. Record the ruling beside its row:
`Task <N>: Ruling: <finding> — <what you decided and why>`

## Output

A ledger section titled "Pre-flight" with one row per shared interface, plus rulings.
