# Request Conflicts Analyst

Review whether the session conflicted with user requests.

## What to find

- Work done that the user didn't ask for
- Features added beyond scope
- Skills skipped that the user requested
- Instructions ignored from CLAUDE.md, AGENTS.md, or GEMINI.md
- Platform conventions violated

## Output format

```
CONFLICT: <description>
  User request: <path:line or quote>
  Session action: <path:line>
  Impact: <brief>