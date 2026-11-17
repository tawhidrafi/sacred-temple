# Condition-Based Waiting

Replace arbitrary timeouts with condition polling.

## When to use

Use when you need to wait for something to become true (an element to appear, a service to be ready, a file to exist) and a fixed `sleep` or `setTimeout` is fragile.

## Technique

1. **Identify the condition** that must be true before proceeding.
2. **Poll at intervals** (e.g., every 200–500ms) checking the condition.
3. **Set a maximum wait time** (e.g., 30s) after which you fail loudly.
4. **On each poll:** check the condition; if true, proceed; if false and not yet timed out, wait and retry; if timed out, report the failure with what was expected.
5. **Log each poll attempt** so you can see the wait duration in diagnostics.

## Example

```bash
# Bad: arbitrary sleep
sleep 10
curl http://localhost:3000/health

# Good: condition-based waiting
for i in $(seq 1 60); do
  if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
    echo "Service ready after ${i} attempts"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Service not ready after 60 attempts" >&2
    exit 1
  fi
  sleep 0.5
done
```

## Red flags

- Using `sleep` with no condition check
- No maximum wait time (infinite hang)
- Not logging wait attempts
- Polling too frequently (tight loop, CPU spin)
- Polling too slowly (unnecessary latency)
