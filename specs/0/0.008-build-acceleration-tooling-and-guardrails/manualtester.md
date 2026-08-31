# Manual Testing Guide: 0.008 Build Acceleration Tooling

## Verification Checklist

### 1. Spec Scaffolding Test
- **Command**: `npm run spec:new test-feature-bootstrap`
- **Expected Outcome**: Creates `specs/0/0.009-test-feature-bootstrap/` with all 5 files in < 100ms.

### 2. Topology Generator Test
- **Command**: `npm run topology:generate`
- **Expected Outcome**: Outputs `.config/ai/topology.json` with complete route and component catalog.

### 3. Smoke Test Harness
- **Command**: `npm run test:smoke`
- **Expected Outcome**: All assertions pass with 100% green checkmarks in < 2 seconds.

### 4. Full Multi-App Build Test
- **Command**: `npm run build:all`
- **Expected Outcome**: Builds both Scout 144 and Delisted CRM cleanly with zero errors.
