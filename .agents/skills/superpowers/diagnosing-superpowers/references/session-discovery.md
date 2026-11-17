# Session Discovery

Resolve each session to a verified absolute filesystem path. Session transcripts are stored per-host; common locations:

- `.kilo/sessions/` — Kilo sessions
- `~/.claude/sessions/` — Claude Code sessions
- `~/.codex/sessions/` — Codex sessions
- `~/.antigravity/sessions/` — Antigravity sessions

## Procedure

1. List candidate session directories.
2. For each candidate, read the first prompt and timestamp to confirm identity.
3. List every candidate you rejected with the reason, or write "none".
4. Enumerate subagent transcripts (child session directories).
5. Create `~/.superpowers/diagnosing-superpowers/<session-id>/` for the confirmed session.
6. Tell your human partner the path.

Output: absolute path to the session directory, plus a list of rejected candidates with reasons.
