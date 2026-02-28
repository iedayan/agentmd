import { join } from 'path';
import { readJsonFile, writeJsonFile } from '@/lib/data/server-persistence';

export type DeliveryStatus = 'received' | 'processed' | 'failed';

type DeliveryRecord = {
  id: string;
  event: string;
  status: DeliveryStatus;
  attempts: number;
  firstSeenAt: string;
  lastSeenAt: string;
  error?: string;
};

type Incident = {
  id: string;
  source: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  openedAt: string;
  resolvedAt?: string;
};

type PersistedReliabilityState = {
  deliveries: DeliveryRecord[];
  incidents: Incident[];
  nextIncidentId: number;
  metrics: {
    totalDeliveries: number;
    duplicateDeliveries: number;
    retryAttempts: number;
  };
};

const RELIABILITY_STATE_PATH = join(process.cwd(), 'apps/dashboard/.data/reliability-state.json');
const MAX_DELIVERY_RECORDS = 1000;

const deliveries = new Map<string, DeliveryRecord>();
let incidents: Incident[] = [];
let nextIncidentId = 100;
let metrics = {
  totalDeliveries: 0,
  duplicateDeliveries: 0,
  retryAttempts: 0,
};

function serialize(): PersistedReliabilityState {
  return {
    deliveries: Array.from(deliveries.values()),
    incidents,
    nextIncidentId,
    metrics,
  };
}

function persist() {
  writeJsonFile(RELIABILITY_STATE_PATH, serialize());
}

function load() {
  const state = readJsonFile<PersistedReliabilityState>(RELIABILITY_STATE_PATH);
  if (!state) {
    persist();
    return;
  }
  deliveries.clear();
  for (const delivery of state.deliveries ?? []) {
    deliveries.set(delivery.id, delivery);
  }
  incidents = Array.isArray(state.incidents) ? state.incidents : [];
  if (typeof state.nextIncidentId === 'number') nextIncidentId = state.nextIncidentId;
  if (state.metrics) {
    metrics = {
      totalDeliveries:
        typeof state.metrics.totalDeliveries === 'number' ? state.metrics.totalDeliveries : 0,
      duplicateDeliveries:
        typeof state.metrics.duplicateDeliveries === 'number'
          ? state.metrics.duplicateDeliveries
          : 0,
      retryAttempts:
        typeof state.metrics.retryAttempts === 'number' ? state.metrics.retryAttempts : 0,
    };
  }
}

load();

function trimDeliveriesIfNeeded() {
  if (deliveries.size <= MAX_DELIVERY_RECORDS) return;
  const sorted = Array.from(deliveries.values()).sort(
    (a, b) => Date.parse(a.lastSeenAt) - Date.parse(b.lastSeenAt),
  );
  for (let i = 0; i < sorted.length - MAX_DELIVERY_RECORDS; i += 1) {
    const id = sorted[i]?.id;
    if (id) deliveries.delete(id);
  }
}

export function registerWebhookDelivery(deliveryId: string, event: string) {
  const now = new Date().toISOString();
  const existing = deliveries.get(deliveryId);
  metrics.totalDeliveries += 1;
  if (existing) {
    existing.attempts += 1;
    existing.lastSeenAt = now;
    metrics.retryAttempts += 1;
    if (existing.attempts > 1) metrics.duplicateDeliveries += 1;
    persist();
    return {
      duplicate: true,
      alreadyProcessed: existing.status === 'processed',
      attempts: existing.attempts,
    };
  }

  deliveries.set(deliveryId, {
    id: deliveryId,
    event,
    status: 'received',
    attempts: 1,
    firstSeenAt: now,
    lastSeenAt: now,
  });
  trimDeliveriesIfNeeded();
  persist();
  return { duplicate: false, alreadyProcessed: false, attempts: 1 };
}

export function markWebhookDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  error?: string,
) {
  const existing = deliveries.get(deliveryId);
  const now = new Date().toISOString();
  if (!existing) {
    deliveries.set(deliveryId, {
      id: deliveryId,
      event: 'unknown',
      status,
      attempts: 1,
      firstSeenAt: now,
      lastSeenAt: now,
      error,
    });
    trimDeliveriesIfNeeded();
    persist();
    return;
  }
  existing.status = status;
  existing.lastSeenAt = now;
  existing.error = error;
  persist();
}

export function openIncident(input: {
  source: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
}) {
  const duplicateOpen = incidents.find(
    (incident) =>
      !incident.resolvedAt &&
      incident.source === input.source &&
      incident.summary.toLowerCase() === input.summary.toLowerCase(),
  );
  if (duplicateOpen) return duplicateOpen;
  const incident: Incident = {
    id: `inc-${++nextIncidentId}`,
    source: input.source,
    severity: input.severity,
    summary: input.summary,
    openedAt: new Date().toISOString(),
  };
  incidents.unshift(incident);
  persist();
  return incident;
}

export function resolveIncident(incidentId: string) {
  const incident = incidents.find((item) => item.id === incidentId);
  if (!incident || incident.resolvedAt) return null;
  incident.resolvedAt = new Date().toISOString();
  persist();
  return incident;
}

export function getReliabilityStats() {
  const openIncidents = incidents.filter((incident) => !incident.resolvedAt);
  const resolved = incidents.filter((incident) => incident.resolvedAt);
  const mttrMinutes =
    resolved.length > 0
      ? Math.round(
          (resolved.reduce((sum, incident) => {
            const opened = Date.parse(incident.openedAt);
            const closed = Date.parse(incident.resolvedAt ?? incident.openedAt);
            return sum + Math.max(0, closed - opened);
          }, 0) /
            resolved.length /
            60000) *
            10,
        ) / 10
      : 0;

  return {
    totalDeliveries: metrics.totalDeliveries,
    duplicateDeliveries: metrics.duplicateDeliveries,
    retryAttempts: metrics.retryAttempts,
    duplicateRate:
      metrics.totalDeliveries > 0
        ? Math.round((metrics.duplicateDeliveries / metrics.totalDeliveries) * 1000) / 10
        : 0,
    openIncidents: openIncidents.length,
    resolvedIncidents: resolved.length,
    mttrMinutes,
    recentIncidents: incidents.slice(0, 20),
    persistedStatePath: RELIABILITY_STATE_PATH,
  };
}
