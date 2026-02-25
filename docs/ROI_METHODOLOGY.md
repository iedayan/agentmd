# ROI Calculator Methodology

The ROI report (`/api/analytics/roi-report`) and dashboard analytics use the following assumptions and formulas. This document explains how we derive value so you can interpret and customize the numbers.

## Inputs (Configurable)

| Parameter | Default | Range | Description |
|-----------|---------|-------|--------------|
| `days` | 30 | 7–365 | Analysis window |
| `hourlyRateUsd` | 120 | 25–500 | Engineering labor cost per hour (USD) |
| `incidentCostUsd` | 1500 | 200–10000 | Cost per prevented failure (e.g., production incident, rollback) |
| `baselineFailureRate` | 0.20 | 0.01–0.95 | Expected failure rate without AgentMD (e.g., 20% = 0.2) |
| `platformCostMonthlyUsd` | 40 | 0–50000 | Your AgentMD subscription cost per month |

## Formulas

### 1. Labor value (automation)

```
automationHoursSaved = (completedExecutions × 8 minutes) / 60
laborValueUsd = automationHoursSaved × hourlyRateUsd
```

**Assumption**: Each execution saves ~8 minutes of manual run/triage time (conservative estimate for build/test/lint flows).

### 2. Failure prevention value

```
observedFailureRate = failedExecutions / completedExecutions
preventedFailures = max(0, (baselineFailureRate - observedFailureRate) × completedExecutions)
failureValueUsd = preventedFailures × incidentCostUsd
```

**Assumption**: If your observed failure rate is lower than the baseline, the difference represents failures prevented by AgentMD (governed execution, deterministic workflows, earlier detection).

### 3. Gross and net value

```
grossValueUsd = laborValueUsd + failureValueUsd
platformCostUsd = (platformCostMonthlyUsd × days) / 30
netValueUsd = grossValueUsd - platformCostUsd
roiMultiple = grossValueUsd / platformCostUsd  (when platformCostUsd > 0)
paybackDays = (platformCostUsd / grossValueUsd) × days  (when grossValueUsd > 0)
```

### 4. Confidence

| Executions analyzed | Confidence |
|--------------------|------------|
| < 80 | low |
| 80–299 | medium |
| ≥ 300 | high |

More executions in the window yield more reliable estimates.

## Caveats

- **Labor value** assumes 8 min/execution; adjust mentally for your workflow (e.g., 5 min for quick checks, 15 min for full pipelines).
- **Failure prevention** depends on a realistic `baselineFailureRate`. If you don't have historical data, 15–25% is a common starting point for CI before governed execution.
- **Incident cost** varies widely (e.g., $200 for a quick fix, $10k+ for a production outage). Use your own incident post-mortem data when possible.
- The calculator does **not** include: reduced context-switching, faster onboarding, compliance/audit value, or avoided security incidents. Those are qualitative benefits.

## API Usage

```
GET /api/analytics/roi-report?days=30&hourlyRateUsd=150&incidentCostUsd=2000&baselineFailureRate=0.2&platformCostMonthlyUsd=40
```

Response includes `assumptions`, `metrics`, `value`, and `confidence`.
