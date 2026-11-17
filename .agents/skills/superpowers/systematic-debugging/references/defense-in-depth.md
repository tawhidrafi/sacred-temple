# Defense-in-Depth

Add validation at multiple layers after finding the root cause of a bug.

## When to use

After a root cause has been identified and fixed, add defense-in-depth to prevent similar failures from reaching users through other paths.

## Technique

1. **Fix at the source** (the root cause you found).
2. **Add validation at the boundary** where bad data enters the system.
3. **Add validation at each layer** the data passes through, checking assumptions.
4. **Add defensive handling at the consumer** so a bad value never crashes the UI or corrupts state.
5. **Log or surface the error** at each layer so future occurrences are observable.

## Example

Root cause: API returns `undefined` for a user profile when the network fails.

Defense-in-depth:
- **API layer:** Return a consistent error shape instead of `undefined`
- **Service layer:** Validate the response shape before passing it on
- **Component layer:** Handle `null`/`undefined` user with a loading or error state
- **UI layer:** Render an error boundary instead of crashing

Each layer catches what the previous layer missed.

## Red flags

- Fixing only at one layer
- Adding validation without fixing the root cause
- Silent swallowing of errors at intermediate layers
- Adding so much validation that legitimate data is blocked
