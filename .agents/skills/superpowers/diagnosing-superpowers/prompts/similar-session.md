# Similar Session Analyst

Find sessions similar to the diagnosed one by signature.

## Inputs

- Confirmed findings turned into a signature
- Candidate sessions listed by mtime and size
- Marker line numbers

## Procedure

1. For each candidate session, check for the same symptom pattern.
2. Use `prompts/similar-session.md` per candidate in parallel.
3. Compare marker line numbers and finding patterns.
4. Append matches to report §9.

## Output

- Matching session IDs
- Similarity score/reason for each
- Recommended next steps
