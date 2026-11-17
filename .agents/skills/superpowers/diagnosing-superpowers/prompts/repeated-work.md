# Repeated Work Analyst

Review whether the session repeated work unnecessarily.

## What to find

- The same task dispatched more than once
- The same file read multiple times without new information
- The same command run multiple times with the same result
- Re-implementation of already-committed work after compaction
- Subagent transcripts that duplicate completed work

## Output format

```
REPEATED: <description>
  First occurrence: <path:line>
  Repeated at: <path:line>
  Cost: <tokens/time estimate>