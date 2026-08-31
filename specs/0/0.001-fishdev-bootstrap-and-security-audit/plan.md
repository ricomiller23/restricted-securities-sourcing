# Implementation Plan: 0.001 FishDev AI Workflow Bootstrap and Monthly Security Audit

## 1. Approach & Strategy
1. **Developer Environment Routing**:
   - Set `DEVELOPER_DIR=/Library/Developer/CommandLineTools` to utilize the standalone Apple Command Line Tools without encountering the interactive Xcode GUI license block.
   - Install `specify-cli` via `uv tool install` and initialize SpecKit with `--ignore-agent-tools`.

2. **File Infrastructure Setup**:
   - Download and link core AI workflow documents: `start.ai`, `fishdev-init.md`, `.config/ai/defaults/constitution.md`.
   - Setup state files: `.config/ai/repo.ai`, `.config/ai/progress.ai`, `.config/ai/handoff.ai`.
   - Setup agent pointers: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.

3. **Security Audit & Remediation**:
   - Execute `npm audit` to catalog vulnerabilities.
   - Run `npm audit fix` to update patch/minor versions safely without breaking application APIs.
   - Verify 0 vulnerabilities remaining.

4. **Build & Regression Verification**:
   - Run `npm run build` (Vite build) to ensure bundle generation is intact.

5. **Version Control Strategy**:
   - Create `.gitignore` to prevent committing build outputs (`dist/`), dependencies (`node_modules/`), and OS artifacts.
   - Initialize git repo, create baseline `main` branch commit, and branch out to `feature/0.001-fishdev-bootstrap-and-security-audit`.
   - Commit all workflow files, specifications, and audit logs.

## 2. Dependencies
- Node.js & npm (active environment)
- uv & python (for specify-cli execution)
- git & Apple Command Line Tools

## 3. Risks and Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| `npm audit fix` introduces breaking package changes | High | Tested `npm run build` immediately; confirmed Vite 6 transforms and builds cleanly |
| Git commands blocked by Xcode license | High | Configured `DEVELOPER_DIR=/Library/Developer/CommandLineTools` |
