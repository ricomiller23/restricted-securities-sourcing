# Task Breakdown: 0.008 Build Acceleration Tooling, Runtime Guardrails & Smoke Testing

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: Automated Spec Scaffolder
- [x] **Task 1.1**: Build `scripts/new_spec.sh` with auto-incrementing release feature numbering and template generation.
- [x] **Task 1.2**: Add `"spec:new"` to root `package.json`.

### Phase 2: Codebase Topology Engine
- [x] **Task 2.1**: Build `scripts/generate_topology.js` to scan routes, hooks, components, and data seeds.
- [x] **Task 2.2**: Generate initial `.config/ai/topology.json`.

### Phase 3: Runtime Schema Validation Guardrails
- [x] **Task 3.1**: Create `lib/schema_validator.js` and `delisted-crm-database/src/utils/schema_validator.js`.
- [x] **Task 3.2**: Integrate schema validation into `lib/sec_ingest.js` and `src/hooks/useIssuersSync.js`.

### Phase 4: Automated Smoke Test Harness
- [x] **Task 4.1**: Build `scripts/smoke_test.js` validating seed counts, API contracts, and build outputs.
- [x] **Task 4.2**: Add `"test:smoke"` to `package.json`.

### Phase 5: Workspace Orchestration & CI Pipeline
- [x] **Task 5.1**: Add `"build:all"`, `"test:all"`, `"dev:all"` to root `package.json`.
- [x] **Task 5.2**: Create `.github/workflows/ci.yml`.

### Phase 6: Verification & Release
- [x] **Task 6.1**: Run `npm run test:smoke` and `npm run build:all`.
- [x] **Task 6.2**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
- [x] **Task 6.3**: Commit, push branch, create PR #10, and merge into `main`.
