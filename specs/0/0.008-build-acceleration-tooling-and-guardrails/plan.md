# Implementation Plan: 0.008 Build Acceleration Tooling, Runtime Guardrails & Smoke Testing

## 1. Technical Strategy

### Phase 1: Automated Spec Scaffolder
- Build `scripts/new_spec.sh` with argument validation, auto-incrementing release feature numbering, template generation, and automatic git branch creation.
- Add `"spec:new": "bash scripts/new_spec.sh"` to root `package.json`.

### Phase 2: Codebase Topology Engine
- Build `scripts/generate_topology.js` to scan `server.js`, `lib/`, `src/`, and `delisted-crm-database/src/`.
- Output structured `.config/ai/topology.json`.
- Add `"topology:generate": "node scripts/generate_topology.js"` to `package.json`.

### Phase 3: Runtime Schema Validation Guardrails
- Create `lib/schema_validator.js` for Scout 144 backend.
- Create `delisted-crm-database/src/utils/schema_validator.js` for Delisted CRM.
- Integrate into `lib/sec_ingest.js` and `delisted-crm-database/src/hooks/useIssuersSync.js`.

### Phase 4: Automated Smoke Test Harness
- Build `scripts/smoke_test.js` validating:
  - Static seed file counts and schema correctness.
  - Backend API endpoint response structures (`/api/feed`, `/api/metrics`, `/api/sync/status`).
  - Frontend production build output integrity.
- Add `"test:smoke": "node scripts/smoke_test.js"` to `package.json`.

### Phase 5: Workspace Orchestration & CI Pipeline
- Update root `package.json` with `"build:all"`, `"test:all"`, `"dev:all"`.
- Create `.github/workflows/ci.yml`.

### Phase 6: Verification & Release
- Execute `npm run test:smoke` and `npm run build:all`.
- Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
- Commit, create PR #10, merge into `main`, and push.
