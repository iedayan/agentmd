# How AgentMD Works

A plain-language explanation of what AgentMD does and how it works.

## What AgentMD Does (Simple Version)

**AGENTS.md** is like a recipe for AI coding tools. It says things like "run tests," "run the build," "run the linter." Most teams only *read* it. AgentMD actually *runs* those steps and checks that they work.

## The Three Main Parts

### 1. Read & Understand (Parse)

AgentMD reads your AGENTS.md and figures out:
- What sections it has (Build, Test, Lint, etc.)
- What commands to run (e.g. `pnpm test`, `pnpm build`)
- Any rules or limits you've set (e.g. "don't run dangerous commands")

Think of it like reading a recipe and listing all the steps before you start cooking.

### 2. Check It's OK (Validate)

Before running anything, AgentMD checks:
- The file isn't empty
- There are no obviously dangerous commands (e.g. "delete everything")
- It has the usual sections (build, test, etc.)

It also gives a **score from 0–100** for how "ready" your AGENTS.md is for AI tools.

### 3. Actually Run It (Execute)

AgentMD runs the commands from your AGENTS.md in order:
1. Parse the file
2. Decide which commands to run
3. Run them in a safe way (with time limits and safety checks)
4. Record what happened (passed, failed, how long it took)

## Why It Matters

Without AgentMD, AI tools might skip steps or do things differently each time. With AgentMD, the same steps run every time, in the same order, and you get a clear record of what ran and whether it passed.

## Is It Safe? (Security Principles)

Running code from an AI tool can be risky. AgentMD is built with three main safety levels:

1. **Automatic Blocking**: If a command looks naturally dangerous (like `rm -rf /` or "delete everything"), AgentMD will stop it before it even starts.
2. **Permission Rules**: You can set a "list of allowed commands" in your AGENTS.md. If it's not on the list, it won't run.
3. **Planning First**: We always "plan" the run before doing it. You can even run in **Dry Run** mode to see exactly what *would* happen without actually touching any files.

## Is It Safe From Outside Threats? (Cloud Security)

When you use AgentMD in the cloud, we protect your data from outside actors:

1. **Locked Doors (Auth)**: We use secure login through GitHub. Only you can access your account.
2. **Private Rooms (Data Isolation)**: Your repositories and execution history are private to your account. Other users cannot see or touch your data.
3. **Traffic Control (Rate Limiting)**: We limit how many requests can be made to our system to prevent bot attacks and keep the platform stable.
4. **Secure Transit**: All communication between your browser and our servers is encrypted using HTTPS (SSL).

---

For technical details, see [CORE_ENGINE_SPEC.md](CORE_ENGINE_SPEC.md) and [CORE_PUBLIC_API.md](CORE_PUBLIC_API.md).
