# Cannot Verify

Read this when a task reviewer reports "⚠️ Cannot verify from diff" items.

## What it means

The reviewer cannot confirm a behavior from the diff alone — it requires runtime evidence (test output, runtime behavior, etc.).

## What to do

1. Check whether the implementer's report already carries test evidence for the item.
2. If yes, note that the item is covered by existing tests.
3. If no, either:
   - Run the verification yourself and report the result, or
   - Park the item with a ruling at the cap

## Output

For each ⚠️ item:
- `path:line` of the relevant code
- Covered by existing tests: yes/no
- Verification result: pass/fail/not-run
- Ruling (if parked): what you decided and why
