# Anthropic Best Practices

Official guidance for skill authoring, complementing superpowers:writing-skills.

## Core principles

1. Skills are reference guides for proven techniques — not narratives
2. One excellent example beats many mediocre ones
3. Skills follow TDD: write failing test first, then skill, then verify
4. Match the guidance form to the baseline failure type
5. No narrative storytelling — techniques, patterns, references only

## Description format

Start with "Use when..." followed by specific triggering conditions and symptoms. Never summarize the workflow.

## Frontmatter

Required fields: `name`, `description`. Name uses only letters, numbers, hyphens.

## Directory structure

```
skill-name/
  SKILL.md      # Required
  supporting.*  # Only for tools or heavy reference
```

Flat namespace — all skills in one searchable namespace.

## Testing

Test skills before deploying. Use pressure scenarios with subagents. RED-GREEN-REFACTOR applies to skills as well as code.
