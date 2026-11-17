# Handling Reports

Read this every time you get a non-DONE status from an implementer subagent.

## Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| DONE | Task complete, review clean | Generate review package, dispatch task reviewer |
| DONE_WITH_CONCERNS | Task complete but concerns flagged | Read concerns, decide whether to fix or park |
| NEEDS_CONTEXT | Implementer needs more information | Answer questions, provide context, re-dispatch |
| BLOCKED | Task cannot proceed | Stop, ask human partner, do not work around |

## For DONE_WITH_CONCERNS

Read the concerns in the report. Each concern is either:
- Fixable by the implementer: resume the implementer with the concern
- A genuine gap: park it with a ruling at the cap
- Not a real issue: dismiss with explanation

## For NEEDS_CONTEXT

Answer clearly and completely. Do not rush the implementer into implementation.

## For BLOCKED

Stop and ask the human partner. Do not attempt workarounds.
