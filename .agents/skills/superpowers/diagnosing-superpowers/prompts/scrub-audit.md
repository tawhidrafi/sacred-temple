# Scrub Audit Prompt

Audit a scrubbed bundle to verify no sensitive information remains.

## Procedure

1. Read every file in the scrubbed bundle.
2. Search for patterns: API keys, tokens, passwords, secrets, personal data, PII.
3. Verify all tool-result bodies are removed (skeleton) or limited to cited events (evidence).
4. Check the scrub log against the files.
5. Return CLEAN if no sensitive info found, or list remaining issues.

## Output

- Status: CLEAN / ISSUES FOUND
- Issues found (if any): file, line, description
- Replacements verified: count
