# Design Spec: Ruflo (Claude Flow) Full Setup

**Date:** 2026-05-26
**Topic:** Ruflo Orchestration Framework Integration
**Status:** Approved

## 1. Goal
The primary goal is to integrate the **Ruflo** (formerly Claude Flow) AI orchestration framework into the "Dance-Class-Booking-App" project. This will enable a multi-agent development environment with persistent memory, specialized swarms, and Model Context Protocol (MCP) tool integration.

## 2. Approach: Automated Full Installation
We will utilize the official Ruflo installation script to ensure a comprehensive setup that includes diagnostics and the full suite of MCP tools.

### 2.1 Orchestration & Swarm Architecture
- **Framework:** Ruflo (Claude Flow).
- **Topology:** "Hive-Mind" architecture featuring a Queen (strategic planner) and specialized Workers (Coder, Tester, Researcher, Reviewer).
- **Tooling:** Model Context Protocol (MCP) integration providing access to 300+ tools.

### 2.2 Scaffolding & Directory Structure
The setup will initialize the following structure in the project root:
- `claude-flow.config.json`: Core orchestration settings (models, providers, swarm rules).
- `.claude/`: Agent definitions, custom slash commands, and helpers.
- `.claude-flow/`: Persistent vector memory (HNSW) and local state.
- `.mcp.json`: Configuration for tool access.

## 3. Implementation Steps
1. **Installation:** Run the full installation shell script via `curl`.
2. **Initialization:** Execute `npx ruflo init` (or legacy `claude-flow init`) to scaffold the project.
3. **Memory Setup:** Initialize the local vector database for trajectory tracking.
4. **Environment:** The user will manually manage API keys in the `.env` file; we will ensure it exists with appropriate placeholders if necessary.

## 4. Verification & Success Criteria
- **Diagnostic Pass:** `ruflo doctor` must return a successful status for all core components.
- **File Presence:** Verification that all core configuration files (`claude-flow.config.json`, `.mcp.json`) are correctly scaffolded.
- **Ready State:** The swarm must be initialized and ready to receive strategic tasks.

## 5. Security & Safety
- **Credentials:** No API keys will be hardcoded. The setup will rely on the `.env` file, which is already ignored by `.gitignore`.
- **Integrity:** The setup script will be monitored for unexpected filesystem modifications outside of the Ruflo scope.
