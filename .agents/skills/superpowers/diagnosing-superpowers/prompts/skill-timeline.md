# Skill Timeline Analyst

Review the session transcript to build a timeline of skill invocations.

## What to find

- Every skill invoked, with `path:line` of the SKILL.md reference
- Whether each skill fired as expected
- Skills that should have fired but didn't
- The order of skill invocations relative to user messages

## Output format

```
SKILL: <name>
  Invoked at: <path:line>
  Fired as expected: yes/no
  Notes: <brief>
```

## Red flags to note

- A skill invoked but never actually followed
- Multiple skills invoked simultaneously without sequencing
- A skill referenced by name but whose SKILL.md is missing
