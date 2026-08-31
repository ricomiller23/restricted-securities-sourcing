# Development Notes: 0.001 FishDev AI Workflow Bootstrap

## macOS Xcode Command Line Tools vs Xcode App
- On macOS systems where Xcode.app has been installed or updated, `xcode-select` default paths (`/Applications/Xcode.app/Contents/Developer`) trigger license prompts when invoked from non-interactive shells.
- Workaround applied: Setting `DEVELOPER_DIR=/Library/Developer/CommandLineTools` enables git execution without requiring interactive `sudo` password entry.
- Permanent resolution recommendation: User may run `sudo xcodebuild -license accept` in their macOS terminal if desired.

## SpecKit CLI Note
- SpecKit installed via `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`.
- Binary located at `~/.local/bin/specify`.

## Vulnerability Remediation
- Vulnerable packages upgraded in `package-lock.json`:
  - `body-parser` (DoS mitigation)
  - `nanoid` (infinite loop mitigation)
  - `postcss` (path traversal mitigation)
  - `shell-quote` (newline and DoS mitigation)
