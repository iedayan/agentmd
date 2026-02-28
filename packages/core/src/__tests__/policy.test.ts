import { describe, it, expect } from 'vitest';
import {
  parsePolicyConfig,
  matchCommandToRule,
  getApprovalRequirement,
} from '../enterprise/policy.js';

describe('parsePolicyConfig', () => {
  it('parses valid YAML policy', () => {
    const policy = parsePolicyConfig(`
version: "1"
defaultApproval: high_risk
rules:
  - id: deploy-prod
    name: Deploy Production
    match: "deploy:*"
    approval: always
    escalateTo:
      - sre@agentmd.online
    budgetMinutes: 15
`);

    expect(policy.version).toBe('1');
    expect(policy.defaultApproval).toBe('high_risk');
    expect(policy.rules).toHaveLength(1);
    expect(policy.rules[0]?.id).toBe('deploy-prod');
  });

  it('rejects invalid version', () => {
    expect(() =>
      parsePolicyConfig(`
version: "2"
rules:
  - id: test
    name: Test
    match: "*"
    approval: always
`),
    ).toThrow(/version must be "1"/);
  });

  it('rejects duplicate rule IDs', () => {
    expect(() =>
      parsePolicyConfig(`
version: "1"
rules:
  - id: duplicate
    name: Rule One
    match: "foo:*"
    approval: always
  - id: duplicate
    name: Rule Two
    match: "bar:*"
    approval: never
`),
    ).toThrow(/duplicate rule id/);
  });

  it('rejects non-positive budgetMinutes', () => {
    expect(() =>
      parsePolicyConfig(`
version: "1"
rules:
  - id: bad-budget
    name: Bad Budget
    match: "*"
    approval: on_failure
    budgetMinutes: 0
`),
    ).toThrow(/budgetMinutes must be a positive integer/);
  });

  it('rejects empty rules array', () => {
    expect(() =>
      parsePolicyConfig(`
version: "1"
rules: []
`),
    ).toThrow(/rules array required/);
  });

  it('rejects invalid defaultApproval', () => {
    expect(() =>
      parsePolicyConfig(`
version: "1"
defaultApproval: invalid
rules:
  - id: test
    name: Test
    match: "*"
    approval: always
`),
    ).toThrow(/defaultApproval must be/);
  });

  it('rejects empty escalateTo array', () => {
    expect(() =>
      parsePolicyConfig(`
version: "1"
rules:
  - id: test
    name: Test
    match: "*"
    approval: always
    escalateTo: []
`),
    ).toThrow(/escalateTo must not be empty/);
  });
});

describe('matchCommandToRule', () => {
  const config = parsePolicyConfig(`
version: "1"
defaultApproval: on_failure
rules:
  - id: deploy
    name: Deploy
    match: "deploy:*"
    approval: always
  - id: pnpm
    name: PNPM
    match: "pnpm *"
    approval: never
`);

  it('matches glob pattern', () => {
    const rule = matchCommandToRule('deploy:prod', config);
    expect(rule?.id).toBe('deploy');
    expect(rule?.approval).toBe('always');
  });

  it('matches pnpm glob', () => {
    const rule = matchCommandToRule('pnpm run build', config);
    expect(rule?.id).toBe('pnpm');
  });

  it('returns undefined when no match', () => {
    const rule = matchCommandToRule('cargo build', config);
    expect(rule).toBeUndefined();
  });

  it('matches regex when prefixed with regex:', () => {
    const cfg = parsePolicyConfig(`
version: "1"
rules:
  - id: terraform
    name: Terraform
    match: "regex:^terraform (apply|destroy)"
    approval: always
`);
    expect(matchCommandToRule('terraform apply', cfg)?.id).toBe('terraform');
    expect(matchCommandToRule('terraform destroy', cfg)?.id).toBe('terraform');
    expect(matchCommandToRule('terraform plan', cfg)).toBeUndefined();
  });
});

describe('getApprovalRequirement', () => {
  it('returns rule approval when matched', () => {
    const config = parsePolicyConfig(`
version: "1"
rules:
  - id: deploy
    name: Deploy
    match: "deploy:*"
    approval: always
`);
    const result = getApprovalRequirement('deploy:prod', config);
    expect(result.requirement).toBe('always');
    expect(result.rule?.id).toBe('deploy');
  });

  it('returns defaultApproval when no match', () => {
    const config = parsePolicyConfig(`
version: "1"
defaultApproval: high_risk
rules:
  - id: x
    name: X
    match: "never-match"
    approval: never
`);
    const result = getApprovalRequirement('pnpm test', config);
    expect(result.requirement).toBe('high_risk');
    expect(result.rule).toBeUndefined();
  });

  it('returns never when no match and no default', () => {
    const config = parsePolicyConfig(`
version: "1"
rules:
  - id: x
    name: X
    match: "never-match"
    approval: always
`);
    const result = getApprovalRequirement('echo hello', config);
    expect(result.requirement).toBe('never');
  });
});
