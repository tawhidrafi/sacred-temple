# Scrub Prompt

You are scrubbing a session bundle for redacting sensitive information before sharing.

## Inputs

- Bundle directory path
- Redaction level: skeleton / evidence / full

## Procedure

1. Read every file in the bundle.
2. For skeleton level: remove all tool-result bodies, keep only file paths and line numbers.
3. For evidence level: keep bodies only for cited events, redact everything else.
4. For full level: keep everything but remove secrets/keys.
5. Remove all secrets, API keys, passwords, tokens, and personal data.
6. Write the scrub log listing every replacement made.

## Output

- Scrubbed bundle files
- Scrub log with replacements
- Status: CLEAN or needs-more-work
