#!/usr/bin/env bash
export DEVELOPER_DIR=/Library/Developer/CommandLineTools
export PATH="/Users/ericmiller/.homebrew/bin:$PATH"
set -e

FEATURE_NAME="$1"

if [ -z "$FEATURE_NAME" ]; then
  echo "Usage: npm run spec:new <feature-name>"
  echo "Example: npm run spec:new sec-filing-alerts"
  exit 1
fi

# Clean up feature name (lowercase, dashes only)
CLEAN_NAME=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | tr ' _' '--' | sed 's/[^a-z0-9-]//g' | sed 's/--*/-/g')

SPECS_DIR="specs/0"
mkdir -p "$SPECS_DIR"

# Find latest feature index
LATEST_NUM=0
for dir in "$SPECS_DIR"/0.*; do
  if [ -d "$dir" ]; then
    BASE=$(basename "$dir")
    NUM=$(echo "$BASE" | grep -oE "^0\.[0-9]+" | sed 's/^0\.//' | sed 's/^0*//')
    if [ -n "$NUM" ] && [ "$NUM" -gt "$LATEST_NUM" ]; then
      LATEST_NUM=$NUM
    fi
  fi
done

NEXT_NUM=$((LATEST_NUM + 1))
NEXT_VERSION=$(printf "0.%03d" "$NEXT_NUM")
FEATURE_DIR="$SPECS_DIR/${NEXT_VERSION}-${CLEAN_NAME}"
BRANCH_NAME="feature/${NEXT_VERSION}-${CLEAN_NAME}"

mkdir -p "$FEATURE_DIR"

# 1. spec.md
cat <<EOF > "$FEATURE_DIR/spec.md"
# Specification: ${NEXT_VERSION} ${FEATURE_NAME}

## 1. Overview
Describe the goal, user intent, and core functionality to be delivered.

## 2. Requirements & Constraints
- [ ] Requirement 1
- [ ] Requirement 2

## 3. Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
EOF

# 2. plan.md
cat <<EOF > "$FEATURE_DIR/plan.md"
# Implementation Plan: ${NEXT_VERSION} ${FEATURE_NAME}

## 1. Technical Strategy

### Phase 1: Architecture & Setup
- Step 1

### Phase 2: Core Implementation
- Step 2

### Phase 3: Verification & Release
- Verify build & automated tests
- Update .config/ai/progress.ai and .config/ai/handoff.ai
EOF

# 3. tasks.md
cat <<EOF > "$FEATURE_DIR/tasks.md"
# Task Breakdown: ${NEXT_VERSION} ${FEATURE_NAME}

## Status Legend
- [ ] Pending
- [x] Completed
- [-] Cancelled/Deferred

---

### Phase 1: Core Implementation
- [ ] **Task 1.1**: Initial setup and implementation.
- [ ] **Task 1.2**: Secondary integration.

### Phase 2: Verification
- [ ] **Task 2.1**: Automated test execution.
- [ ] **Task 2.2**: Documentation and progress update.
EOF

# 4. manualtester.md
cat <<EOF > "$FEATURE_DIR/manualtester.md"
# Manual Testing Guide: ${NEXT_VERSION} ${FEATURE_NAME}

## Verification Checklist
- **Step 1**: Test primary flow.
- **Expected Outcome**: Expected result.
EOF

# 5. notes.md
cat <<EOF > "$FEATURE_DIR/notes.md"
# Development Notes: ${NEXT_VERSION} ${FEATURE_NAME}

- Design decisions and context.
EOF

# Create git branch if not already on it
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi

echo "============================================="
echo " ✅ SpecKit Scaffold Created Successfully!"
echo " Directory: $FEATURE_DIR"
echo " Git Branch: $BRANCH_NAME"
echo " Files Created: spec.md, plan.md, tasks.md, manualtester.md, notes.md"
echo "============================================="
