# Development Notes: 0.007 TOCA Architecture

## Architecture Rules
- Sizing limit: Single component target < 250 lines.
- Hooks layer: State, effect listeners, and network sync extracted to `src/hooks/`.
- Bundler splitting: Split third-party vendor code from application logic.
