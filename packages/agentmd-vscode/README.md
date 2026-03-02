<div align="center">
  <img src="https://raw.githubusercontent.com/iedayan/agentmd/main/packages/agentmd-vscode/media/icon.png" width="128" alt="AgentMD Logo">
  <h1>AgentMD for VS Code</h1>
  <p>The standard execution layer for AI Coding Agents.</p>
</div>

***

**AgentMD** is the official language server and linter for `AGENTS.md` files. 

If you use AI coding agents (like Cursor, Cline, Copilot, or Aider), you've likely experienced them hallucinating build commands, struggling to run your tests, or failing to understand how your specific project is compiled. 

`AGENTS.md` solves this by providing a standardized, machine-readable ledger of your repository's exact workflows. This extension brings real-time validation, scoring, and scaffolding directly into your editor so you can ensure your project is perfectly "agent-ready."

## ⚡ Core Features

### 1. Real-Time Diagnostics & Linting
Stop guessing if your `AGENTS.md` is formatted correctly. AgentMD acts as an ESLint for your agent instructions:
* **Live Validation:** Instantly flags missing required blocks (Build, Test), empty commands, and malformed frontmatter.
* **Smart Error Detection:** Warns against dangerous commands and syntax inconsistencies.
* **Visual Indicators:** All issues appear natively in the VS Code Problems view.

### 2. Live Agent-Readiness Scoring
How easy is it for an AI to seamlessly work in your repository?
* **Live Score Badge:** View a real-time `0-100` readiness score directly in your VS Code Status Bar.
* **Actionable Breakdowns:** Click the score to see exactly which commands or context blocks your repository is missing. Track improvements over time.

### 3. One-Click Template Library
Don't write `AGENTS.md` files from scratch. AgentMD ships with 17+ pre-built, agent-optimized framework templates. 
* Open the Command Palette (`Cmd+Shift+P`) and type **`AgentMD: Create from Template`**.
* Generate perfect scaffolds instantly for React, Next.js, Python, Rust, Go, FastAPI, NestJS, Monorepos, and more.

### 4. Dry-Run Execution
Want to see exactly what commands the AI is going to run based on your `AGENTS.md` file? Use the built-in `--dry-run` command execution preview directly from the editor to safely inspect workflows before they touch your machine.

---

## 🛠 Usage

1. **Create or Open:** Generate or open an `AGENTS.md` file in the root of your workspace.
2. **Instant Feedback:** Diagnostics will immediately appear in the Problems view, and your Readiness Score will populate the status bar.
3. **Execute Commands:**
   * **`AgentMD: Validate AGENTS.md`** `(Cmd+Shift+V)`
   * **`AgentMD: Show Score Breakdown`** `(Cmd+Shift+S)`
   * **`AgentMD: Create from Template`**
   * **`AgentMD: Dry Run Execution`**

## ⚙️ Configuration

AgentMD provides flexible workspace settings:
* `agentmd.diagnostics.enabled`: Toggle real-time diagnostics on/off.
* `agentmd.diagnostics.debounceMs`: Adjust the validation delay (default: 300ms).
* `agentmd.score.showInStatusBar`: Pin or unpin the real-time score badge.
* `agentmd.autoValidate`: Validate automatically on file save.

## 🤝 Support & Community

* Read the full framework documentation at **[AgentMD Docs](https://agentmd.online)**
* Report an issue on **[GitHub](https://github.com/iedayan/agentmd/issues)**
* Join the **[Discussions](https://github.com/iedayan/agentmd/discussions)**
