# Final Review

Read this when every task is complete. Covers the whole-branch review, its single fix wave, and how to finish.

## Whole-branch review

Run `review-package PLAN_FILE MERGE_BASE HEAD` and review from the printed file.

With a subagent tool: dispatch the reviewer on the most capable available model using `superpowers:requesting-code-review`'s code-reviewer prompt. Specify the model explicitly.

Without a subagent tool: read `code-reviewer.md` and perform the review yourself as a separate pass.

## Re-grade findings

The reviewer's severity labels are advice; the gate is yours. Re-grade by effect: what a reasonable person using this software gets if it ships.

- Critical and Important: enter the fix pass (ONE pass, each fix verified by TDD)
- Minor: go to the ledger as `Final: minor (deferred): <one-liner>`

## Fix pass

Fix Critical and Important findings yourself in ONE pass. Each fix:
1. Write the test that reproduces the finding
2. Watch it fail
3. Make it pass
4. Run the whole suite

Record each in the ledger as `Final: fixed <finding> — <test name> RED→GREEN, suite <N>/<N>`

## Finish

Before deleting anything, collect every ledger line containing `Ruling:` into your final message under "Rulings I made", and every `minor (deferred)` line under "Deferred minors".

When the final review is clean and fixes are committed, delete this plan's workspace directory.

Use `superpowers:finishing-a-development-branch`.
