#!/usr/bin/env node

/**
 * AgentMD Security Audit
 * Scans for security vulnerabilities and compliance issues.
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = join(ROOT_DIR, 'packages');

/**
 * Security issue interface
 */
class SecurityIssue {
  constructor(severity, file, line, message, recommendation) {
    this.severity = severity;
    this.file = file;
    this.line = line;
    this.message = message;
    this.recommendation = recommendation;
  }
}

/**
 * Scan for hardcoded secrets
 */
function scanForSecrets(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Secret patterns
  const secretPatterns = [
    { pattern: /password\s*=\s*['"]\w+['"]/, type: 'Hardcoded password' },
    { pattern: /api[_-]?key\s*=\s*['"]\w+['"]/, type: 'Hardcoded API key' },
    { pattern: /secret[_-]?key\s*=\s*['"]\w+['"]/, type: 'Hardcoded secret key' },
    { pattern: /token\s*=\s*['"]\w+['"]/, type: 'Hardcoded token' },
    { pattern: /['"][A-Za-z0-9+/]{40,}['"]/, type: 'Potential base64 secret' },
    { pattern: /sk-[a-zA-Z0-9]{24,}/, type: 'Stripe secret key' },
    { pattern: /ghp_[a-zA-Z0-9]{36}/, type: 'GitHub personal token' },
    { pattern: /xoxb-[a-zA-Z0-9-]+/, type: 'Slack bot token' },
  ];
  
  lines.forEach((line, index) => {
    secretPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(line)) {
        issues.push(new SecurityIssue(
          'high',
          filePath,
          index + 1,
          `${type} detected`,
          'Use environment variables or secret management'
        ));
      }
    });
  });
  
  return issues;
}

/**
 * Scan for unsafe imports
 */
function scanForUnsafeImports(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Unsafe patterns
  const unsafePatterns = [
    { pattern: /eval\s*\(/, type: 'Use of eval()' },
    { pattern: /Function\s*\(/, type: 'Dynamic function creation' },
    { pattern: /new\s+Function\s*\(/, type: 'Dynamic function creation' },
    { pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]/, type: 'setTimeout with string' },
    { pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]/, type: 'setInterval with string' },
  ];
  
  lines.forEach((line, index) => {
    unsafePatterns.forEach(({ pattern, type }) => {
      if (pattern.test(line)) {
        issues.push(new SecurityIssue(
          'medium',
          filePath,
          index + 1,
          type,
          'Use safer alternatives or validate inputs'
        ));
      }
    });
  });
  
  return issues;
}

/**
 * Scan for SQL injection vulnerabilities
 */
function scanForSQLInjection(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // SQL injection patterns
  const sqlPatterns = [
    { pattern: /\$\{.*\}.*\s*(SELECT|INSERT|UPDATE|DELETE)/i, type: 'Template literal in SQL' },
    { pattern: /['"`][^'"`]*\+\s*.*\s*(SELECT|INSERT|UPDATE|DELETE)/i, type: 'String concatenation in SQL' },
    { pattern: /execute\s*\(\s*['"`][^'"`]*\$\{/i, type: 'Template literal in execute' },
  ];
  
  lines.forEach((line, index) => {
    sqlPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(line)) {
        issues.push(new SecurityIssue(
          'high',
          filePath,
          index + 1,
          `Potential SQL injection: ${type}`,
          'Use parameterized queries or prepared statements'
        ));
      }
    });
  });
  
  return issues;
}

/**
 * Scan for XSS vulnerabilities
 */
function scanForXSS(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // XSS patterns
  const xssPatterns = [
    { pattern: /innerHTML\s*=/, type: 'Direct innerHTML assignment' },
    { pattern: /outerHTML\s*=/, type: 'Direct outerHTML assignment' },
    { pattern: /document\.write\s*\(/, type: 'document.write usage' },
    { pattern: /dangerouslySetInnerHTML/, type: 'React dangerouslySetInnerHTML' },
  ];
  
  lines.forEach((line, index) => {
    xssPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(line)) {
        issues.push(new SecurityIssue(
          'medium',
          filePath,
          index + 1,
          `Potential XSS: ${type}`,
          'Use safe HTML sanitization or alternative methods'
        ));
      }
    });
  });
  
  return issues;
}

/**
 * Scan file for security issues
 */
function scanFile(filePath) {
  const issues = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Skip certain file types
    const skipExtensions = ['.map', '.min.js', '.lock', '.log'];
    if (skipExtensions.includes(extname(filePath))) {
      return issues;
    }
    
    // Run all scans
    issues.push(...scanForSecrets(content, filePath));
    issues.push(...scanForUnsafeImports(content, filePath));
    issues.push(...scanForSQLInjection(content, filePath));
    issues.push(...scanForXSS(content, filePath));
    
  } catch (error) {
    // Skip files that can't be read
  }
  
  return issues;
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
  const issues = [];
  
  if (currentDepth >= maxDepth) {
    return issues;
  }
  
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories
        const skipDirs = ['node_modules', '.git', 'dist', 'coverage', '.next'];
        if (!skipDirs.includes(entry.name)) {
          issues.push(...scanDirectory(fullPath, maxDepth, currentDepth + 1));
        }
      } else if (entry.isFile()) {
        issues.push(...scanFile(fullPath));
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return issues;
}

/**
 * Run npm audit
 */
function runNpmAudit() {
  console.log('🔍 Running npm audit...');
  
  try {
    const output = execSync('npm audit --json', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const auditResult = JSON.parse(output);
    const vulnerabilities = auditResult.vulnerabilities || {};
    
    const issues = [];
    
    for (const [packageName, vuln] of Object.entries(vulnerabilities)) {
      for (const severity of ['critical', 'high', 'moderate', 'low']) {
        if (vuln[severity] > 0) {
          issues.push(new SecurityIssue(
            severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
            `package: ${packageName}`,
            0,
            `${vuln[severity]} ${severity} vulnerabilities`,
            `Update ${packageName} to latest version`
          ));
        }
      }
    }
    
    return issues;
    
  } catch (error) {
    console.log('⚠️  npm audit failed');
    return [];
  }
}

/**
 * Check for outdated dependencies
 */
function checkOutdatedDependencies() {
  console.log('📦 Checking for outdated dependencies...');
  
  try {
    const output = execSync('npm outdated --json', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const outdated = JSON.parse(output);
    const issues = [];
    
    for (const [packageName, info] of Object.entries(outdated)) {
      const current = info.current;
      const latest = info.latest;
      
      // Flag major version updates as medium security
      const currentMajor = parseInt(current.split('.')[0].replace(/[^\d]/g, ''));
      const latestMajor = parseInt(latest.split('.')[0].replace(/[^\d]/g, ''));
      
      if (latestMajor > currentMajor) {
        issues.push(new SecurityIssue(
          'medium',
          `package: ${packageName}`,
          0,
          `Major version update available: ${current} → ${latest}`,
          `Update ${packageName} to get security fixes`
        ));
      }
    }
    
    return issues;
    
  } catch (error) {
    console.log('ℹ️  No outdated dependencies or npm outdated failed');
    return [];
  }
}

/**
 * Main security audit
 */
async function runSecurityAudit() {
  console.log('🔒 AgentMD Security Audit\n');
  console.log('─'.repeat(50));
  
  const allIssues = [];
  
  // Scan source code
  console.log('🔍 Scanning source code...');
  const codeIssues = scanDirectory(PACKAGES_DIR);
  allIssues.push(...codeIssues);
  
  // Run npm audit
  const auditIssues = runNpmAudit();
  allIssues.push(...auditIssues);
  
  // Check outdated dependencies
  const outdatedIssues = checkOutdatedDependencies();
  allIssues.push(...outdatedIssues);
  
  // Sort issues by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  // Display results
  console.log('\n📊 Security Issues Found');
  console.log('─'.repeat(50));
  
  if (allIssues.length === 0) {
    console.log('✅ No security issues found!');
  } else {
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const highIssues = allIssues.filter(i => i.severity === 'high');
    const mediumIssues = allIssues.filter(i => i.severity === 'medium');
    const lowIssues = allIssues.filter(i => i.severity === 'low');
    
    console.log(`🚨 Critical: ${criticalIssues.length}`);
    console.log(`⚠️  High: ${highIssues.length}`);
    console.log(`⚡ Medium: ${mediumIssues.length}`);
    console.log(`ℹ️  Low: ${lowIssues.length}`);
    
    // Show detailed issues
    console.log('\n📋 Detailed Issues');
    console.log('─'.repeat(50));
    
    allIssues.forEach((issue, index) => {
      const icon = {
        critical: '🚨',
        high: '⚠️',
        medium: '⚡',
        low: 'ℹ️'
      }[issue.severity];
      
      console.log(`\n${icon} Issue #${index + 1}: ${issue.severity.toUpperCase()}`);
      console.log(`   File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
      console.log(`   Message: ${issue.message}`);
      console.log(`   Recommendation: ${issue.recommendation}`);
    });
    
    // Recommendations
    console.log('\n💡 Security Recommendations');
    console.log('─'.repeat(50));
    
    if (criticalIssues.length > 0) {
      console.log('🚨 Address critical issues immediately');
    }
    
    if (highIssues.length > 0) {
      console.log('⚠️  Fix high-severity issues in next sprint');
    }
    
    if (auditIssues.length > 0) {
      console.log('📦 Update vulnerable dependencies');
    }
    
    if (codeIssues.length > 0) {
      console.log('🔍 Review code for security best practices');
    }
    
    console.log('🔒 Implement security scanning in CI/CD pipeline');
    console.log('📚 Train team on secure coding practices');
  }
  
  console.log('\n✅ Security audit completed');
  
  // Exit with error code if critical issues found
  if (criticalIssues.length > 0) {
    process.exit(1);
  }
}

// Run security audit
runSecurityAudit().catch(console.error);
