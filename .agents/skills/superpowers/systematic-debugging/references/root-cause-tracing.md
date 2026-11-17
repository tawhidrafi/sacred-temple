# Root-Cause Tracing

Trace a bug backward through the call stack to find its original trigger.

## When to use

Use when the error is deep in a call stack and you cannot see the source from the stack trace alone.

## Technique

1. **Start at the failure point.** Note the exact error, file, and line where it surfaced.
2. **Identify the bad value.** What value or state is wrong at the failure point?
3. **Trace upward.** Find the caller that supplied the bad value. Ask:
   - Where did this value originate?
   - What called this function with the bad value?
   - What transformed the value before it arrived here?
4. **Repeat upward** until you find the original source — the first point where the value was correct, then became wrong.
5. **Fix at the source**, not at the symptom.

## Example

```
Error: Cannot read property 'id' of undefined
  at UserProfile.render (components/UserProfile.js:45)
  at Dashboard.mount (components/Dashboard.js:120)
  at App.initialize (app.js:300)
```

Trace:
- `UserProfile.render` receives `undefined` for `user` from `Dashboard.mount`
- `Dashboard.mount` gets `user` from `App.initialize`, which fetches it from an API
- The API call returns `undefined` when the network request fails

Root cause: `App.initialize` doesn't handle the API failure case before passing the result to `Dashboard.mount`.

Fix: Add a null check or error boundary in `App.initialize` before passing data downstream.

## Red flags

- Fixing at the failure point instead of the source
- Tracing only one level up
- Assuming "this can't be the source" without checking
- Stopping when you find a plausible-looking but unproven cause
