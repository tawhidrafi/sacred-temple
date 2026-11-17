# Bundle README

## Redaction levels

- **Skeleton:** no tool-result bodies
- **Evidence:** bodies only for cited events
- **Full:** everything

## Procedure

1. Ask the redaction level, stating what each includes.
2. Build the bundle per this template.
3. Dispatch `prompts/scrub.md`, then `prompts/scrub-audit.md`, repeating until the audit returns CLEAN.
4. Complete the bundle template's evidence check and reconciliation.
5. Archive only after approval (`zip -r` or `tar -czf`).
6. With the archive path, state what it contains, point at the scrub log, and say scrubbing can miss things: they must review every file before sharing.

## Evidence checklist

- [ ] All cited events have bodies included (evidence level) or excluded (skeleton level)
- [ ] No secrets or keys in any file
- [ ] Scrub log written
- [ ] File list written
- [ ] Human partner approved
