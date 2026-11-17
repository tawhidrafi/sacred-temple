# Cost and Time Analyst

Review wall-clock time and token cost for the session.

## What to find

- Total turns in the session
- Approximate token usage (from transcript sizes)
- Time spent on repeated work vs. forward progress
- Most expensive skills (by invocation count and context usage)
- Where time was lost to stumbles or context loss

## Output format

```
METRIC: <name>
  Value: <number>
  Source: <path:line or method>
  Notes: <brief>
```

## Red flags

- High token cost with little forward progress
- Many turns spent on verification without action
- Context compaction causing re-reading of files
