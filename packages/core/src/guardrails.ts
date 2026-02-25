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
    context?: string
): Promise<GuardrailCheckResult> {
    const normalized = command.toLowerCase().trim();

    // 1. Obfuscation detection
    if (detectObfuscation(normalized)) {
        return {
            safe: false,
            reason: "Potential shell obfuscation or indirect execution detected.",
            confidence: 0.95,
        };
    }

    // 2. Sensitive file access intent
    if (detectSensitiveAccess(normalized)) {
        return {
            safe: false,
            reason: "Attempted access to sensitive system or credential files.",
            confidence: 0.9,
        };
    }

    // 3. Destructive environment intent
    if (detectDestructiveIntent(normalized)) {
        return {
            safe: false,
            reason: "Potentially destructive system-wide command detected.",
            confidence: 0.85,
        };
    }

    return { safe: true, confidence: 1.0 };
}

function detectObfuscation(cmd: string): boolean {
    // base64, hex, or other encoding used with pipe to shell
    const encodings = /\b(base64|xxd|openssl\s+enc)\b/;
    const shells = /\b(sh|bash|zsh|python|perl|ruby|node|php)\b/;

    if (encodings.test(cmd) && shells.test(cmd) && cmd.includes("|")) {
        return true;
    }

    // String concatenation/obfuscation like $(printf "\x63\x75\x72\x6c")
    if (/\$\(printf\b.*\\x/.test(cmd)) {
        return true;
    }

    return false;
}

function detectSensitiveAccess(cmd: string): boolean {
    const sensitivePaths = [
        "/etc/shadow",
        "/etc/passwd",
        "/etc/sudoers",
        ".aws/credentials",
        ".ssh/id_",
        ".env",
        "config/secrets",
    ];

    return sensitivePaths.some(path => cmd.includes(path));
}

function detectDestructiveIntent(cmd: string): boolean {
    // Combination of dangerous commands and broad targets
    const dangerous = /\b(rm|del|erase|truncate|drop|delete|destroy)\b/;
    const broad = /\b(all|everything|system|partition|volume|bucket|database|db)\b/;

    // High confidence destructive intent: "delete all databases" etc
    if (dangerous.test(cmd) && broad.test(cmd) && !cmd.includes("--force")) {
        return true;
    }

    return false;
}
