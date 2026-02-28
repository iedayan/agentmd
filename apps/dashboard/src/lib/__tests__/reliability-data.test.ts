import { describe, expect, it } from 'vitest';
import {
  getReliabilityStats,
  markWebhookDeliveryStatus,
  openIncident,
  registerWebhookDelivery,
  resolveIncident,
} from '../analytics/reliability-data';

describe('reliability-data', () => {
  it('tracks webhook deliveries and duplicate attempts', () => {
    const id = `vitest-delivery-${Date.now()}`;
    const first = registerWebhookDelivery(id, 'check_run');
    expect(first.duplicate).toBe(false);
    expect(first.alreadyProcessed).toBe(false);

    markWebhookDeliveryStatus(id, 'processed');

    const second = registerWebhookDelivery(id, 'check_run');
    expect(second.duplicate).toBe(true);
    expect(second.alreadyProcessed).toBe(true);
  });

  it('opens and resolves incidents', () => {
    const incident = openIncident({
      source: 'vitest',
      severity: 'low',
      summary: `Synthetic incident ${Date.now()}`,
    });
    expect(incident.id).toContain('inc-');

    const resolved = resolveIncident(incident.id);
    expect(resolved?.resolvedAt).toBeDefined();
  });

  it('returns aggregate reliability stats', () => {
    const stats = getReliabilityStats();
    expect(typeof stats.totalDeliveries).toBe('number');
    expect(typeof stats.duplicateRate).toBe('number');
    expect(Array.isArray(stats.recentIncidents)).toBe(true);
  });
});
