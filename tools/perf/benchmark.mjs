#!/usr/bin/env node

/**
 * AgentMD Performance Benchmarking
 * Measures parsing, validation, and execution performance.
 */

import { performance } from 'perf_hooks';
import { readFileSync as _readFileSync } from 'fs';
import { join } from 'path';

// Import core functionality (adjust paths as needed)
const { parseAgentsMd, validateAgentsMd, computeAgentReadinessScore } = await import(
  join(process.cwd(), 'packages/core/dist/index.js')
);

/**
 * Benchmark result interface
 * @typedef {Object} BenchmarkResult
 * @property {string} name
 * @property {number} iterations
 * @property {number} totalTime
 * @property {number} avgTime
 * @property {number} minTime
 * @property {number} maxTime
 * @property {number} opsPerSecond
 */

/**
 * Run a single benchmark
 */
function runBenchmark(name, fn, iterations = 100) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / avgTime;

  return {
    name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    opsPerSecond
  };
}

/**
 * Create test content of different sizes
 */
function createTestContent(size) {
  const sections = [
    '# Testing Instructions',
    'Run the test suite with the following commands:',
    '```bash',
    'npm test',
    '```',
    '',
    '## Build Process',
    'Build the application using:',
    '```bash',
    'npm run build',
    '```',
    '',
    '## Deployment',
    'Deploy to production:',
    '```bash',
    'npm run deploy',
    '```'
  ];

  let content = sections.join('\n');

  // Scale content based on size
  for (let i = 0; i < size; i++) {
    content += `\n\n## Section ${i + 1}\n`;
    content += `Content for section ${i + 1}.\n`;
    content += '```bash\n';
    content += `command-${i}\n`;
    content += '```\n';
  }

  return content;
}

/**
 * Main benchmark suite
 */
async function runBenchmarks() {
  console.log('🚀 AgentMD Performance Benchmarks\n');

  const results = [];

  // Test different content sizes
  const sizes = [
    { name: 'Small', sections: 5 },
    { name: 'Medium', sections: 25 },
    { name: 'Large', sections: 100 },
    { name: 'XLarge', sections: 500 }
  ];

  for (const size of sizes) {
    console.log(`\n📊 ${size.name} Content (${size.sections} sections)`);
    console.log('─'.repeat(50));

    const content = createTestContent(size.sections);

    // Parsing benchmark
    const parseResult = runBenchmark(
      'Parse',
      () => parseAgentsMd(content),
      50
    );
    results.push(parseResult);

    // Validation benchmark
    const parsed = parseAgentsMd(content);
    const validationResult = runBenchmark(
      'Validate',
      () => validateAgentsMd(parsed),
      30
    );
    results.push(validationResult);

    // Scoring benchmark
    const scoreResult = runBenchmark(
      'Score',
      () => computeAgentReadinessScore(parsed),
      20
    );
    results.push(scoreResult);

    // Display results
    [parseResult, validationResult, scoreResult].forEach(result => {
      console.log(`${result.name.padEnd(12)}: ${result.avgTime.toFixed(2)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/s`);
    });
  }

  // Memory usage benchmark
  console.log('\n💾 Memory Usage');
  console.log('─'.repeat(50));

  const memBefore = process.memoryUsage();
  const largeContent = createTestContent(1000);

  // Parse many documents to test memory usage
  for (let i = 0; i < 100; i++) {
    parseAgentsMd(largeContent);
  }

  const memAfter = process.memoryUsage();

  console.log(`Heap Used: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Total: ${(memAfter.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`RSS: ${(memAfter.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Memory Increase: ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`);

  // Summary
  console.log('\n📈 Summary');
  console.log('─'.repeat(50));

  const parseResults = results.filter(r => r.name === 'Parse');
  const validateResults = results.filter(r => r.name === 'Validate');
  const scoreResults = results.filter(r => r.name === 'Score');

  console.log(`Parsing Performance:`);
  parseResults.forEach((result, i) => {
    const size = sizes[i];
    console.log(`  ${size.name.padEnd(8)}: ${result.opsPerSecond.toFixed(0)} ops/s`);
  });

  console.log(`\nValidation Performance:`);
  validateResults.forEach((result, i) => {
    const size = sizes[i];
    console.log(`  ${size.name.padEnd(8)}: ${result.opsPerSecond.toFixed(0)} ops/s`);
  });

  console.log(`\nScoring Performance:`);
  scoreResults.forEach((result, i) => {
    const size = sizes[i];
    console.log(`  ${size.name.padEnd(8)}: ${result.opsPerSecond.toFixed(0)} ops/s`);
  });

  // Performance recommendations
  console.log('\n💡 Performance Recommendations');
  console.log('─'.repeat(50));

  const avgParseOps = parseResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / parseResults.length;
  const avgValidateOps = validateResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / validateResults.length;

  if (avgParseOps < 100) {
    console.log('⚠️  Consider optimizing parsing for better performance');
  }

  if (avgValidateOps < 200) {
    console.log('⚠️  Consider optimizing validation logic');
  }

  if (memAfter.heapUsed - memBefore.heapUsed > 100 * 1024 * 1024) {
    console.log('⚠️  High memory usage detected, consider implementing caching');
  }

  console.log('✅ Benchmark completed');
}

// Run benchmarks
runBenchmarks().catch(console.error);
