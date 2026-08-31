# Development Notes: 0.003 Launch Time Optimization

## Bottleneck Diagnostics
1. **Multiple File Reads**:
   - Reading 117 individual JSON files from disk requires 117 system calls, JSON string allocations, and GC cycles (~150 MB raw JSON).
   - Solution: Pre-compile into a single compact index payload (~5 MB) that loads in a single ~12ms read.

2. **Hardcoded Launcher Sleep**:
   - `sleep 2` in bash unconditionally pauses for 2000ms even when the servers are ready in ~200ms.
   - Solution: Fast HTTP loop (`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/`) with `sleep 0.05` polling.
