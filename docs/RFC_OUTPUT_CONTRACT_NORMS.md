# RFC: Output Contract Norms for AGENTS.md

## Summary

Instruction standardization is necessary but insufficient. To make coding agents predictable
across tools, teams need a portable output contract that defines what "done" looks like.

This RFC proposes a shared `output_contract` block in AGENTS.md frontmatter and invites tool
vendors and engineering teams to align on these fields.

## Proposed Norm

Every production AGENTS.md SHOULD define:

- `output_contract.format`
- `output_contract.schema`
- `output_contract.quality_gates`
- `output_contract.artifacts`
- `output_contract.exit_criteria`

## Why This Matters

- Reduces onboarding friction between tools.
- Makes CI checks deterministic and automatable.
- Improves trust by enforcing explicit completion criteria.

## Reference Structure

```yaml
output_contract:
  format: json
  schema:
    summary: string
    files_changed: array
  quality_gates:
    - tests_pass
  artifacts:
    - patches
  exit_criteria:
    - ready_for_review
```

## Validation Path

- Definition check: `agentmd check . --contract`
- Output check: `agentmd check . --contract --output agent-output.json`

## Starter Contracts

- [`docs/contracts/bugfix-pr.yaml`](./contracts/bugfix-pr.yaml)
- [`docs/contracts/refactor.yaml`](./contracts/refactor.yaml)
- [`docs/contracts/migration.yaml`](./contracts/migration.yaml)
- [`docs/contracts/incident-fix.yaml`](./contracts/incident-fix.yaml)

## Call for Alignment

We invite AI coding tool vendors, platform teams, and open-source maintainers to adopt this
contract shape (or propose compatible extensions) so AGENTS.md guidance and outcomes become
portable across ecosystems.
