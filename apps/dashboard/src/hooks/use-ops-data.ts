"use client";

import { useState, useEffect } from "react";
import type { Pipeline, PolicyRule, AuditEntry } from "@/app/ops/mock-data";

export interface OpsAnalytics {
  pipelinesRun: number;
  pipelinesRunSparkline: number[];
  policyViolationRate: number;
  policyViolationTrend: "down" | "up";
  avgApprovalTimeHours: number;
  approvalTimeTrend: "down" | "up";
  agentSuccessRate: number;
  violationsByRule: Array<{ rule: string; count: number }>;
  pipelineVolume: Array<{ date: string; running: number; completed: number; failed: number }>;
  mostBlockedAgents: Array<{ sourceRef: string; count: number }>;
}

const EMPTY_ANALYTICS: OpsAnalytics = {
  pipelinesRun: 0,
  pipelinesRunSparkline: [],
  policyViolationRate: 0,
  policyViolationTrend: "down",
  avgApprovalTimeHours: 0,
  approvalTimeTrend: "down",
  agentSuccessRate: 0,
  violationsByRule: [],
  pipelineVolume: [],
  mostBlockedAgents: [],
};

export interface OpsData {
  pipelines: Pipeline[];
  policies: PolicyRule[];
  audit: AuditEntry[];
  analytics: OpsAnalytics;
  loading: boolean;
  error: string | null;
}

export interface UseOpsDataOptions {
  loadAnalytics?: boolean;
}

export function useOpsData(options?: UseOpsDataOptions): OpsData {
  const loadAnalytics = options?.loadAnalytics ?? false;
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [analytics, setAnalytics] = useState<OpsAnalytics>(EMPTY_ANALYTICS);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [pipRes, polRes, audRes] = await Promise.all([
          fetch("/api/ops/pipelines"),
          fetch("/api/ops/policies"),
          fetch("/api/ops/audit"),
        ]);

        if (cancelled) return;

        if (pipRes.ok) {
          const { pipelines: p } = await pipRes.json();
          setPipelines(Array.isArray(p) ? p : []);
        }
        if (polRes.ok) {
          const { policies: pol } = await polRes.json();
          setPolicies(Array.isArray(pol) ? pol : []);
        }
        if (audRes.ok) {
          const { audit: a } = await audRes.json();
          setAudit(Array.isArray(a) ? a : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Ops data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loadAnalytics || analyticsLoaded) {
      return;
    }

    let cancelled = false;

    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/ops/analytics");
        if (!response.ok || cancelled) {
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setAnalytics(data as OpsAnalytics);
          setAnalyticsLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Ops analytics");
        }
      }
    }

    void fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [analyticsLoaded, loadAnalytics]);

  return { pipelines, policies, audit, analytics, loading, error };
}
