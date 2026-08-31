# Specification: 0.001 FishDev AI Workflow Bootstrap and Monthly Security Audit

## 1. Overview
This specification establishes the FishDev AI workflow foundation and executes the mandatory monthly dependency security audit for the `restricted-securities-sourcing` repository.

## 2. Background & Problem Statement
The repository previously lacked standardized AI session controls, an authoritative constitution, and structured specification tooling. During initialization, macOS developer environment constraints (pending Xcode GUI license acceptance) blocked standard `git` invocations during `specify-cli` installation. In addition, existing project dependencies contained 5 known vulnerabilities (including 2 critical and 2 high).

## 3. Goals
- Successfully bootstrap the FishDev AI development workflow (`start.ai`, `.config/ai/`, `.specify/`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).
- Resolve `specify-cli` installation by routing around Xcode license blocks via Command Line Tools (`/Library/Developer/CommandLineTools`).
- Execute monthly security audit and remediate critical/high vulnerabilities via `npm audit fix`.
- Establish specification standard conforming to Section XVIII of the FishDev Constitution (`specs/<release>/<feature>/`).
- Initialize version control on a feature branch with comprehensive documentation.

## 4. Non-Goals
- Modifying core application business logic or UI components in this initialization release.
- Forcing full Xcode GUI license updates that require interactive sudo authentication from automated subagents.

## 5. Architectural Changes
- Added `.config/ai/` directory containing authoritative repository settings (`repo.ai`), progress tracking (`progress.ai`), handoff state (`handoff.ai`), and defaults (`defaults/constitution.md`).
- Added `.specify/` directory configured with SpecKit templates and memory constitution (`.specify/memory/constitution.md`).
- Added AI-agnostic pointer documents (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) pointing to `start.ai`.
- Updated `package-lock.json` with secure package resolutions for `body-parser`, `nanoid`, `postcss`, and `shell-quote` (via `concurrently`).

## 6. Acceptance Criteria
- [x] SpecKit CLI is functional and returns valid version (`specify 1.0.3.dev0`).
- [x] FishDev startup guide (`start.ai`) and constitution are present and verified.
- [x] `npm audit` reports 0 vulnerabilities.
- [x] `npm run build` succeeds without errors or regressions.
- [x] Git repository is initialized, feature branch created, and commits cleanly structured.
