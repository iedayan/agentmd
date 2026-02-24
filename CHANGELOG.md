# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Core execution preflight planner:
  - `planCommandExecutions`
  - `requiresShellFeatures`
  - `CommandExecutionPlan` / `CommandExecutionPlanItem`
- CLI UX:
  - `agentmd doctor` command
  - `agentmd run` now shows preflight summary and blocked-command reasons
- Dashboard integration and reliability APIs:
  - `/api/integrations/github/pr-checks`
  - `/api/integrations/slack/actions`
  - `/api/analytics/roi-report`
  - `/api/ops/slo`
- Reliability subsystem:
  - webhook delivery dedupe/retry stats
  - incident lifecycle tracking
- Open-source readiness documentation:
  - `SECURITY.md`
  - `CONTRIBUTING.md`
  - `docs/CORE_PUBLIC_API.md`
  - `docs/SEMVER_POLICY.md`
  - `docs/PERFORMANCE.md`
- Core benchmark runner:
  - `pnpm --filter @agentmd/core run bench`

### Changed

- Strengthened default safe execution behavior and explicit shell opt-in flow
- Expanded API and route test coverage for integrations/reliability/ROI
- Clarified experimental/internal module status for enterprise and marketplace exports

## [0.1.0] - Initial

- Core parser, validator, executor
- CLI and SDK
- Dashboard (Next.js)
