# Flowcharts

When to use flowcharts in a skill:

- The decision process is non-obvious and benefits from visualization
- Multiple branches with clear conditions
- The flowchart teaches, not decorates

## Graphviz conventions

- Use `digraph` with `rankdir` for direction
- Nodes use `shape=box` for processes, `shape=diamond` for decisions
- Keep labels short and semantic (not "step1", "step2")
- No code inside flowchart nodes

## Rendering

Render to SVG or PNG before including. Verify the flowchart is readable at small size.

## When NOT to use

- Simple linear sequences (use a numbered list instead)
- When a table communicates the same information more clearly
- When the flowchart adds no decision logic
