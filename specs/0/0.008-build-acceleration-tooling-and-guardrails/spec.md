# Specification: 0.008 Build Acceleration Tooling, Runtime Guardrails & Smoke Testing

## 1. Overview
This specification delivers a comprehensive developer productivity and reliability suite across this repository. It introduces automated SpecKit scaffolding (`npm run spec:new`), pre-computed codebase topology maps (`.config/ai/topology.json`), SEC schema validation guardrails, a sub-2-second automated smoke test harness (`npm run test:smoke`), a unified multi-app workspace orchestrator (`npm run build:all`), and a GitHub Actions CI pipeline.

## 2. Requirements & Constraints
1. **SpecKit Automated Scaffolder (`scripts/new_spec.sh`)**:
   - Analyzes existing `specs/` directories, auto-increments feature version (e.g. `0.009`), creates `spec.md`, `plan.md`, `tasks.md`, `manualtester.md`, and `notes.md`, creates git branch, and completes in < 100ms.
2. **Codebase Topology Engine (`scripts/generate_topology.js`)**:
   - Generates `.config/ai/topology.json` mapping all Express endpoints, React components, custom hooks, and data models.
3. **Runtime Schema Validation Guardrails (`lib/schema_validator.js` & `delisted-crm-database/src/utils/schema_validator.js`)**:
   - Enforces CIK normalization, email/phone cleansing, date formatting, and score bounds on all ingested SEC records.
4. **Automated Smoke Test Suite (`scripts/smoke_test.js`)**:
   - Headless test validating port readiness, endpoint latencies, seed data counts, and build artifacts in < 2 seconds.
5. **Unified Multi-App Workspace Orchestrator**:
   - Adds `"build:all"`, `"dev:all"`, `"test:all"`, `"topology:generate"`, `"spec:new"` to root `package.json`.
6. **GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)**:
   - Automatically runs smoke tests and builds on all pull requests and pushes to `main`.

## 3. Acceptance Criteria
- [x] `npm run spec:new <feature-name>` creates new specs and git branches instantly.
- [x] `npm run topology:generate` outputs complete `.config/ai/topology.json`.
- [x] `npm run test:smoke` executes and passes in < 2 seconds.
- [x] Ingestion schema validators prevent malformed SEC records from entering the database.
- [x] `npm run build:all` compiles both Scout 144 and Delisted CRM cleanly.
- [x] `.github/workflows/ci.yml` is active and validated.
