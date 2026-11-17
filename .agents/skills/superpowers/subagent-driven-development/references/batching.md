# Batching

Read this before dispatching several small same-shape edits as separate tasks.

## When to batch

When the plan lists several small edits of the same kind across files, consider batching them into one task instead of dispatching one subagent per edit.

## When NOT to batch

- Edits touch shared state or coupled interfaces
- One edit's output is another edit's input
- A reviewer could meaningfully reject one edit while approving its neighbor

## Output

If batching, create one task with multiple steps (one per file). If not batching, dispatch one subagent per edit as normal.
