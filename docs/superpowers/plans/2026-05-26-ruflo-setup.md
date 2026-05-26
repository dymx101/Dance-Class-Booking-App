# Ruflo Full Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Ruflo orchestration framework with full MCP capabilities and multi-agent swarm support.

**Architecture:** Automated installation using the official shell script followed by non-interactive project initialization and diagnostic verification.

**Tech Stack:** Ruflo (Claude Flow), Model Context Protocol (MCP), Node.js.

---

### Task 1: System-wide Installation

**Files:**
- Create: None (System-wide install)

- [ ] **Step 1: Execute the full installation script**

Run: `curl -fsSL https://cdn.jsdelivr.net/gh/ruvnet/ruflo@main/scripts/install.sh | bash -s -- --full`
Expected: Installation completes without errors, `ruflo` command becomes available.

- [ ] **Step 2: Verify installation**

Run: `ruflo --version`
Expected: Displays the current version of Ruflo.

### Task 2: Project Initialization

**Files:**
- Create: `claude-flow.config.json`, `.mcp.json`, `CLAUDE.md`
- Create: `.claude/`, `.claude-flow/`

- [ ] **Step 1: Initialize Ruflo in the project root**

Run: `npx ruflo@latest init --no-interactive --force --v3-mode`
Expected: Files `claude-flow.config.json` and `.mcp.json` are created in the project root.

- [ ] **Step 2: Verify scaffolding**

Run: `ls -a | grep -E "claude-flow.config.json|.mcp.json|.claude|.claude-flow"`
Expected: All files/directories are listed.

- [ ] **Step 3: Commit initial configuration**

```bash
git add claude-flow.config.json .mcp.json CLAUDE.md
git commit -m "chore: initialize ruflo orchestration framework"
```

### Task 3: Environment Configuration

**Files:**
- Modify: `.env.example`
- Modify: `.env` (User action required, but we will add placeholders)

- [ ] **Step 1: Add Ruflo placeholders to .env.example**

Add the following to `.env.example`:
```env
# Ruflo / Claude Flow Configuration
ANTHROPIC_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

- [ ] **Step 2: Ensure .env exists with placeholders**

If `.env` doesn't exist, copy from `.env.example`. If it does, append the placeholders if missing.

- [ ] **Step 3: Commit environment changes**

```bash
git add .env.example
git commit -m "chore: add ruflo api key placeholders to env"
```

### Task 4: Final Verification & Diagnostics

**Files:**
- None

- [ ] **Step 1: Run Ruflo diagnostics**

Run: `ruflo doctor`
Expected: All core components (Memory, Swarm, MCP) show a PASS or READY status. Note: API keys might fail if the user hasn't added them yet, which is expected.

- [ ] **Step 2: Verify swarm readiness**

Run: `ruflo swarm status`
Expected: Displays the status of the "Hive-Mind" swarm.
