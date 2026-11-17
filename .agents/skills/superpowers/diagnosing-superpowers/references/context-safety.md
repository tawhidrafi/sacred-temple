# Context Safety

One transcript line can be a megabyte. Follow these rules on every session file, every time.

## Rules

1. **Never load an entire transcript into context at once.** Read specific line ranges.
2. **Use `grep` to find relevant sections** before reading.
3. **Use `offset` and `limit`** when reading files to avoid loading megabytes of text.
4. **Never paste full transcript lines into subagent prompts.** Pass absolute paths and line numbers instead.
5. **If a line is over 10KB**, read it in chunks, not all at once.

## Violation

Loading a multi-megabyte transcript into context is a context-safety violation. Use targeted reads instead.
