# Resuming

Read this before anything else when resuming a plan with an existing ledger.

## Whose ledger is it?

Check the first line of `<workspace>/progress.md`. If it names your plan file, you can resume. If it names a different plan file, start your own ledger fresh.

## Where to resume

Tasks with a `Task <N>: complete` line are DONE — do not redo them. Resume at the first task without a completion line.

Their commits exist in git even when your context no longer remembers making them. After compaction, trust the ledger and `git log` over your own recollection.

## Pre-flight

Before resuming, run the preflight scan from `references/preflight.md` and check for interface conflicts between tasks.
