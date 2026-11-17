# Quality Evidence Analyst

Review whether quality claims are backed by evidence.

## What to find

- Completion claims without verification command output
- "Tests pass" claims without test command output
- "Lint clean" claims without lint output
- Bug fixed claims without reproduction test
- Expressions of satisfaction before verification

## Output format

```
CLAIM: <what was claimed>
  Stated at: <path:line>
  Verification evidence: <path:line or "none">
  Status: verified / unverified / contradicted