# Manual Testing Guide: 0.003 Launch Time Optimization & Benchmarking

## Testing Checklist

### 1. Benchmark Execution
- **Command**: `npm run benchmark`
- **Expected Outcome**:
  - Reports raw cache parse time vs compact index load time.
  - Reports backend Express and Vite startup response times.
  - Confirms percentage improvement.

### 2. Launcher Verification
- **Action**: Launch `./Launch\ Scout\ 144.command`
- **Expected Outcome**:
  - Chrome opens immediately as soon as port 3000 is ready (under 400-500ms).
  - No noticeable wait or frozen browser tabs.

### 3. Data Integrity & Sourcing Feed Verification
- **Action**: Visit `http://127.0.0.1:3000/` and browse filings register, CRM board, and scoring configurations.
- **Expected Outcome**:
  - All 37,612+ filings are present and correctly scored.
  - Scoring updates properly recalculate without errors.
