/**
 * Enterprise Audit Logs
 * Who ran what when - full action trail for compliance (SOC2, HIPAA).
 */
/**
 * PII masking for logs and outputs.
 * Masks emails, tokens, secrets in audit and execution logs.
 */
export function maskPii(text) {
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
    .replace(/\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]+\b/g, '[TOKEN_REDACTED]')
    .replace(/\b(?:sk-|pk_)[A-Za-z0-9]+\b/g, '[KEY_REDACTED]')
    .replace(/\b[A-Za-z0-9]{32,}\b/g, (m) => (m.length > 40 ? '[REDACTED]' : m));
}
