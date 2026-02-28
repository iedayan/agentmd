import {
  listRepositories,
  getRepositoryById,
  listExecutions,
  getExecutionById,
  getDashboardCounts,
} from './dashboard-data';
import type { DataLayer } from './data-layer';

export const inMemoryDataLayer: DataLayer = {
  listRepositories,
  getRepositoryById,
  listExecutions,
  getExecutionById,
  getDashboardCounts,
};

export function getDataLayer(): DataLayer {
  // When DATABASE_URL is set, could return a PostgreSQL implementation.
  // For now, always use in-memory.
  return inMemoryDataLayer;
}
