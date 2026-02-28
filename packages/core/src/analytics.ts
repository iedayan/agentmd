import { readFileSync } from 'fs';

/**
 * Usage Analytics for AgentMD
 * Tracks product metrics while respecting privacy.
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface ProductMetrics {
  // Activation metrics
  agentsMdCreated: number;
  validationRuns: number;
  cliInstalls: number;

  // Engagement metrics
  weeklyActiveTeams: number;
  averageSessionDuration: number;
  featureUsage: Record<string, number>;

  // Quality metrics
  validationErrors: number;
  securityBlocks: number;
  templateAdoption: Record<string, number>;
}

/**
 * Analytics client that respects privacy and GDPR.
 */
export class AnalyticsClient {
  private apiKey: string;
  private endpoint: string;
  private userId?: string;
  private sessionId: string;

  constructor(apiKey: string, endpoint = 'https://api.agentmd.io/v1/events') {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Set user identifier for analytics.
   * Should be a hashed or anonymized identifier, not PII.
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Track an analytics event.
   */
  async track(event: string, properties?: Record<string, unknown>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Don't track in development/test environments
    if (this.isDevelopmentEnvironment()) {
      console.debug('Analytics:', analyticsEvent);
      return;
    }

    try {
      await this.sendEvent(analyticsEvent);
    } catch (error) {
      // Fail silently to not impact product functionality
      console.warn('Failed to send analytics event:', error);
    }
  }

  /**
   * Track AGENTS.md file creation/validation.
   */
  async trackAgentsMdValidation(
    filePath: string,
    score: number,
    errorCount: number,
    warningCount: number,
  ): Promise<void> {
    await this.track('agents_md_validated', {
      file_type: this.detectFileType(filePath),
      score_range: this.getScoreRange(score),
      error_count: errorCount,
      warning_count: warningCount,
      has_commands: true, // Could be detected from parsed content
    });
  }

  /**
   * Track CLI usage.
   */
  async trackCliCommand(command: string, flags: string[]): Promise<void> {
    await this.track('cli_command', {
      command,
      flag_count: flags.length,
      has_dry_run: flags.includes('--dry-run'),
      has_use_shell: flags.includes('--use-shell'),
    });
  }

  /**
   * Track IDE/editor usage.
   */
  async trackEditorUsage(
    editor: 'vscode' | 'cursor' | 'other',
    action: 'validation' | 'completion' | 'hover',
  ): Promise<void> {
    await this.track('editor_usage', {
      editor,
      action,
    });
  }

  /**
   * Track template usage.
   */
  async trackTemplateUsage(templateId: string, framework: string): Promise<void> {
    await this.track('template_used', {
      template_id: templateId,
      framework,
    });
  }

  /**
   * Track security events (anonymized).
   */
  async trackSecurityEvent(
    eventType: 'command_blocked' | 'guardrail_triggered',
    commandType: string,
    riskLevel: string,
  ): Promise<void> {
    await this.track('security_event', {
      event_type: eventType,
      command_type: commandType,
      risk_level: riskLevel,
      // Never include the actual command for privacy
    });
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'User-Agent': `AgentMD/${this.getVersion()}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`);
    }
  }

  private sanitizeProperties(
    properties?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Remove any potential PII
      if (this.isPiiField(key)) {
        continue;
      }

      // Sanitize file paths
      if (typeof value === 'string' && this.isFilePath(value)) {
        sanitized[key] = this.sanitizePath(value);
        continue;
      }

      // Only include primitive values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private isPiiField(fieldName: string): boolean {
    const piiFields = ['email', 'name', 'username', 'token', 'key', 'secret', 'password'];
    return piiFields.some((pii) => fieldName.toLowerCase().includes(pii));
  }

  private isFilePath(value: string): boolean {
    return value.includes('/') || value.includes('\\') || value.endsWith('.md');
  }

  private sanitizePath(path: string): string {
    // Replace user-specific paths with generic ones
    return path
      .replace(/\/Users\/[^/]+/g, '/Users/[user]')
      .replace(/\/home\/[^/]+/g, '/home/[user]')
      .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\[user]');
  }

  private detectFileType(filePath: string): string {
    if (filePath.includes('packages/') || filePath.includes('src/')) return 'package';
    if (filePath.includes('apps/')) return 'application';
    if (filePath.includes('docs/')) return 'documentation';
    return 'other';
  }

  private getScoreRange(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private isDevelopmentEnvironment(): boolean {
    return (
      process.env.NODE_ENV === 'development' ||
      process.env.AGENTMD_ENV === 'development' ||
      !process.env.AGENTMD_ANALYTICS_ENABLED
    );
  }

  private getVersion(): string {
    try {
      // Try to read version from package.json
      const packageJson = JSON.parse(readFileSync('../../package.json', 'utf-8'));
      return packageJson.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Global analytics instance (initialized in main entry points).
 */
export let analytics: AnalyticsClient | null = null;

/**
 * Initialize analytics with API key.
 */
export function initializeAnalytics(apiKey: string): void {
  analytics = new AnalyticsClient(apiKey);
}

/**
 * Get analytics instance (returns null if not initialized).
 */
export function getAnalytics(): AnalyticsClient | null {
  return analytics;
}

/**
 * Convenience function for tracking events when analytics is available.
 */
export async function track(event: string, properties?: Record<string, unknown>): Promise<void> {
  if (analytics) {
    await analytics.track(event, properties);
  }
}
