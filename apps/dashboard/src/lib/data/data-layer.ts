/**
 * Data layer abstraction for AgentMD dashboard.
 * Currently uses in-memory implementation. Can be extended to use PostgreSQL
 * when DATABASE_URL is set (see deploy/migrations/001_initial.sql).
 */

import type { Execution, Repository } from '@/types';

export interface DataLayer {
  listRepositories(options?: { owner?: string; search?: string }): Repository[];
  getRepositoryById(id: string): Repository | undefined;
  listExecutions(options?: {
    repositoryId?: string;
    status?: Execution['status'];
    limit?: number;
  }): Execution[];
  getExecutionById(id: string): Execution | undefined;
  getDashboardCounts(): {
    executionMinutesUsed: number;
    totalCommandsRun: number;
    totalCommandsFailed: number;
  };
}

export { getDataLayer } from './data-layer-in-memory';
