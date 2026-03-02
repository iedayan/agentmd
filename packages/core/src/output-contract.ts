import type { ParsedAgentsMd, ValidationError, ValidationWarning } from './types.js';

export interface OutputContractValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

type JsonType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';

function detectJsonType(value: unknown): JsonType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    default:
      return 'undefined';
  }
}

export function validateOutputAgainstContract(
  parsed: ParsedAgentsMd,
  outputContent: string,
): OutputContractValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const contract = parsed.frontmatter?.output_contract;

  if (!contract) {
    errors.push({
      code: 'MISSING_OUTPUT_CONTRACT',
      message: 'Cannot validate output because frontmatter.output_contract is missing',
      severity: 'error',
    });
    return { valid: false, errors, warnings };
  }

  const format = String(contract.format ?? 'json').toLowerCase();
  if (format !== 'json') {
    warnings.push({
      code: 'OUTPUT_CONTRACT_FORMAT_UNCHECKED',
      message: `Output validation currently supports json format only (found: ${format})`,
      severity: 'warning',
    });
    return { valid: errors.length === 0, errors, warnings };
  }

  let payload: Record<string, unknown>;
  try {
    const parsedJson = JSON.parse(outputContent) as unknown;
    if (!parsedJson || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
      errors.push({
        code: 'INVALID_OUTPUT_JSON',
        message: 'Output must be a top-level JSON object',
        severity: 'error',
      });
      return { valid: false, errors, warnings };
    }
    payload = parsedJson as Record<string, unknown>;
  } catch {
    errors.push({
      code: 'INVALID_OUTPUT_JSON',
      message: 'Output is not valid JSON',
      severity: 'error',
    });
    return { valid: false, errors, warnings };
  }

  for (const [key, expectedTypeRaw] of Object.entries(contract.schema)) {
    const expectedType = expectedTypeRaw.toLowerCase();
    if (!(key in payload)) {
      errors.push({
        code: 'OUTPUT_SCHEMA_MISSING_KEY',
        message: `Output missing required key from contract schema: ${key}`,
        severity: 'error',
      });
      continue;
    }
    if (expectedType === 'any') continue;
    const actualType = detectJsonType(payload[key]);
    if (actualType !== expectedType) {
      errors.push({
        code: 'OUTPUT_SCHEMA_TYPE_MISMATCH',
        message: `Output key "${key}" expected ${expectedType}, got ${actualType}`,
        severity: 'error',
      });
    }
  }

  const qualityGates = payload.quality_gates;
  for (const gate of contract.quality_gates) {
    const passed =
      qualityGates &&
      typeof qualityGates === 'object' &&
      !Array.isArray(qualityGates) &&
      (qualityGates as Record<string, unknown>)[gate] === true;
    if (!passed) {
      errors.push({
        code: 'OUTPUT_QUALITY_GATE_FAILED',
        message: `Output quality gate did not pass: ${gate}`,
        severity: 'error',
      });
    }
  }

  const artifacts = payload.artifacts;
  for (const artifact of contract.artifacts) {
    const foundInArray = Array.isArray(artifacts) && artifacts.includes(artifact);
    const foundInObject =
      artifacts &&
      typeof artifacts === 'object' &&
      !Array.isArray(artifacts) &&
      artifact in (artifacts as Record<string, unknown>);
    if (!foundInArray && !foundInObject) {
      errors.push({
        code: 'OUTPUT_ARTIFACT_MISSING',
        message: `Output missing required artifact: ${artifact}`,
        severity: 'error',
      });
    }
  }

  const exitCriteria = payload.exit_criteria;
  for (const criterion of contract.exit_criteria) {
    const met =
      exitCriteria &&
      typeof exitCriteria === 'object' &&
      !Array.isArray(exitCriteria) &&
      (exitCriteria as Record<string, unknown>)[criterion] === true;
    if (!met) {
      errors.push({
        code: 'OUTPUT_EXIT_CRITERIA_UNMET',
        message: `Output exit criterion not met: ${criterion}`,
        severity: 'error',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
