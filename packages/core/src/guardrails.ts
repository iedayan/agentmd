/**
 * Intent-based Guardrails for AgentMD
 * Goes beyond simple regex to analyze the semantic intent of commands.
 */

export interface GuardrailCheckResult {
  safe: boolean;
  reason?: string;
  confidence: number;
}

/**
 * Perform a multi-layer safety check on a command.
 * Standard implementation focuses on heuristic-based "intent" detection.
 */
export async function checkCommandIntent(
  command: string,
  context?: string,
): Promise<GuardrailCheckResult> {
  const normalized = command.toLowerCase().trim();

  // 1. Path traversal detection (check first to avoid false positives on sensitive file checks)
  if (detectPathTraversal(normalized)) {
    return {
      safe: false,
      reason: 'Path traversal attempt detected.',
      confidence: 0.9,
    };
  }

  // 2. Obfuscation detection
  if (detectObfuscation(normalized)) {
    return {
      safe: false,
      reason: 'Potential shell obfuscation or indirect execution detected.',
      confidence: 0.95,
    };
  }

  // 3. Sensitive file access intent
  if (detectSensitiveAccess(normalized)) {
    return {
      safe: false,
      reason: 'Attempted access to sensitive system or credential files.',
      confidence: 0.9,
    };
  }

  // 4. Destructive environment intent
  if (detectDestructiveIntent(normalized)) {
    return {
      safe: false,
      reason: 'Potentially destructive system-wide command detected.',
      confidence: 0.85,
    };
  }

  // 5. Environment variable injection detection
  if (detectEnvVarInjection(normalized)) {
    return {
      safe: false,
      reason: 'Potential credential/environment variable exfiltration detected.',
      confidence: 0.85,
    };
  }

  // 6. System modification detection
  if (detectSystemModification(normalized)) {
    return {
      safe: false,
      reason: 'Attempted system configuration modification detected.',
      confidence: 0.9,
    };
  }

  // 7. Cryptocurrency mining detection
  if (detectCryptoMining(normalized)) {
    return {
      safe: false,
      reason: 'Potential cryptocurrency mining or unauthorized resource usage detected.',
      confidence: 0.95,
    };
  }

  void context; // reserved for future context-aware checks
  return { safe: true, confidence: 1.0 };
}

function detectObfuscation(cmd: string): boolean {
  // base64, hex, or other encoding used with pipe to shell
  const encodings = /\b(base64|xxd|openssl\s+enc)\b/;
  const shells = /\b(sh|bash|zsh|python|perl|ruby|node|php)\b/;

  if (encodings.test(cmd) && shells.test(cmd) && cmd.includes('|')) {
    return true;
  }

  // String concatenation/obfuscation like $(printf "\x63\x75\x72\x6c")
  if (/\$\(printf\b.*\\x/.test(cmd)) {
    return true;
  }

  // IFS manipulation or variable-based command obfuscation
  if (/\$ifs|\${ifs}/.test(cmd)) {
    return true;
  }

  return false;
}

function detectSensitiveAccess(cmd: string): boolean {
  const sensitivePaths = [
    '/etc/shadow',
    '/etc/passwd',
    '/etc/sudoers',
    '.aws/credentials',
    '.ssh/id_',
    '.env',
    'config/secrets',
    '/.netrc',
    '/.pgpass',
    '/proc/self/environ',
  ];

  return sensitivePaths.some((path) => cmd.includes(path));
}

function detectDestructiveIntent(cmd: string): boolean {
  // Combination of dangerous commands and broad targets
  const dangerous = /\b(rm|del|erase|truncate|drop|delete|destroy)\b/;
  const broad = /\b(all|everything|system|partition|volume|bucket|database|db)\b/;

  // High confidence destructive intent: "delete all databases", "drop db", etc.
  if (dangerous.test(cmd) && broad.test(cmd)) {
    return true;
  }

  return false;
}

/**
 * Detect path traversal attempts (e.g. ../../etc/passwd).
 */
function detectPathTraversal(cmd: string): boolean {
  // Three or more consecutive ../ traversals targeting system paths
  if (/(?:\.\.\/){3,}/.test(cmd)) {
    return true;
  }

  // Traversal that resolves to well-known sensitive paths
  const traversalToSensitive = /\.\.\/(\.\.\/)*etc\/(passwd|shadow|sudoers)/;
  if (traversalToSensitive.test(cmd)) {
    return true;
  }

  return false;
}

/**
 * Detect commands that attempt to exfiltrate environment variables or secrets.
 * Examples: "curl ... $AWS_SECRET", "echo $GITHUB_TOKEN | nc host port"
 */
function detectEnvVarInjection(cmd: string): boolean {
  const sensitiveVarPattern =
    /\$(aws_secret|aws_access|github_token|github_pat|npm_token|ci_registry_password|database_url|secret_key|api_key|private_key|password|passwd|credentials)/i;

  // Env var used in network call (exfiltration)
  const networkCommands = /\b(curl|wget|nc|ncat|socat|ssh)\b/;
  if (sensitiveVarPattern.test(cmd) && networkCommands.test(cmd)) {
    return true;
  }

  // Printing secrets to stdout with redirection or pipe to remote
  const printCommands = /\b(echo|printf|cat|printenv)\b/;
  const piped = /\|.*\b(nc|ncat|curl|wget|socat)\b/;
  if (sensitiveVarPattern.test(cmd) && printCommands.test(cmd) && piped.test(cmd)) {
    return true;
  }

  return false;
}

/**
 * Detect commands that attempt to modify system configuration or persistence.
 * Examples: modifying system files, creating startup services, registry edits
 */
function detectSystemModification(cmd: string): boolean {
  const systemPaths = [
    '/etc/',
    '/usr/bin/',
    '/usr/sbin/',
    '/bin/',
    '/sbin/',
    '/system/',
    '/boot/',
    '/lib/',
    '/lib64/',
    'C:\\Windows\\',
    'C:\\Program Files\\',
    'C:\\ProgramData\\',
  ];

  const dangerousWriteOps =
    /\b(chmod|chown|mount|umount|systemctl|service|launchctl|defaults|reg|sc|powershell)\b/;

  // Check if command writes to system paths with dangerous operations
  if (
    systemPaths.some((path) => cmd.includes(path)) &&
    (cmd.includes('>') || cmd.includes('>>') || dangerousWriteOps.test(cmd))
  ) {
    return true;
  }

  return false;
}

/**
 * Detect potential cryptocurrency mining or unauthorized resource usage.
 */
function detectCryptoMining(cmd: string): boolean {
  const miningPatterns = [
    /\b(cryptonight|ethash|equihash|xmrig|ccminer|t-rex|nbminer)\b/i,
    /\b(stratum|pool|mining|hashrate|wallet)\b/i,
    /\b(cpu|gpu).*\b(mining|mine)\b/i,
  ];

  return miningPatterns.some((pattern) => pattern.test(cmd));
}
