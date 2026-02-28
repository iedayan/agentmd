#!/usr/bin/env node

/**
 * AgentMD Release Automation
 * Automated version bumping, changelog generation, and package publishing.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = join(ROOT_DIR, 'packages');

/**
 * Get current version from package.json
 */
function getCurrentVersion(packagePath) {
  const packageJson = JSON.parse(readFileSync(join(packagePath, 'package.json'), 'utf-8'));
  return packageJson.version;
}

/**
 * Bump version based on semantic versioning
 */
function bumpVersion(current, type = 'patch') {
  const [major, minor, patch] = current.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

/**
 * Update package.json version
 */
function updatePackageVersion(packagePath, newVersion) {
  const packageJsonPath = join(packagePath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * Generate changelog entry
 */
function generateChangelogEntry(version, type, packages) {
  const date = new Date().toISOString().split('T')[0];
  const typeEmoji = {
    major: '🚀',
    minor: '✨',
    patch: '🐛'
  };
  
  let changelog = `## [${version}] - ${date}\n\n`;
  
  if (packages.length > 1) {
    changelog += `### ${typeEmoji[type]} Updated Packages\n\n`;
    packages.forEach(pkg => {
      changelog += `- **@agentmd/${pkg}**: Version bump to ${version}\n`;
    });
  } else {
    changelog += `### ${typeEmoji[type]} Changes\n\n`;
    changelog += `- Version bump to ${version}\n`;
  }
  
  changelog += '\n';
  return changelog;
}

/**
 * Update CHANGELOG.md
 */
function updateChangelog(version, type, packages) {
  const changelogPath = join(ROOT_DIR, 'CHANGELOG.md');
  const currentChangelog = readFileSync(changelogPath, 'utf-8');
  const newEntry = generateChangelogEntry(version, type, packages);
  
  // Insert new entry after the first line
  const lines = currentChangelog.split('\n');
  lines.splice(1, 0, newEntry);
  writeFileSync(changelogPath, lines.join('\n'));
}

/**
 * Run tests for all packages
 */
function runTests() {
  console.log('🧪 Running tests...');
  try {
    execSync('pnpm run test', { stdio: 'inherit' });
    console.log('✅ All tests passed');
  } catch (error) {
    console.error('❌ Tests failed');
    process.exit(1);
  }
}

/**
 * Build all packages
 */
function buildPackages() {
  console.log('🔨 Building packages...');
  try {
    execSync('pnpm run build', { stdio: 'inherit' });
    console.log('✅ All packages built');
  } catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
  }
}

/**
 * Publish packages to npm
 */
function publishPackages(packages) {
  console.log('📦 Publishing packages...');
  
  for (const pkg of packages) {
    const packagePath = join(PACKAGES_DIR, pkg);
    try {
      console.log(`Publishing @agentmd/${pkg}...`);
      execSync('npm publish --access public', { 
        cwd: packagePath, 
        stdio: 'inherit' 
      });
      console.log(`✅ Published @agentmd/${pkg}`);
    } catch (error) {
      console.error(`❌ Failed to publish @agentmd/${pkg}`);
      process.exit(1);
    }
  }
}

/**
 * Create git tag and push
 */
function createGitTag(version) {
  console.log(`🏷️ Creating git tag v${version}...`);
  try {
    execSync(`git add -A`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' });
    execSync(`git tag v${version}`, { stdio: 'inherit' });
    execSync(`git push origin main --tags`, { stdio: 'inherit' });
    console.log(`✅ Git tag v${version} created and pushed`);
  } catch (error) {
    console.error('❌ Git operations failed');
    process.exit(1);
  }
}

/**
 * Main release function
 */
async function release() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  const dryRun = args.includes('--dry-run');
  
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error('Usage: node release.mjs [major|minor|patch] [--dry-run]');
    process.exit(1);
  }

  console.log(`🚀 Starting ${type} release${dryRun ? ' (dry run)' : ''}...`);

  // Get all packages
  const packages = [
    'core',
    'cli', 
    'sdk',
    'integrations',
    'integrations-vscode',
    'integrations-cursor',
    'workflows',
    'templates'
  ].filter(pkg => {
    const packagePath = join(PACKAGES_DIR, pkg);
    try {
      return readFileSync(join(packagePath, 'package.json'), 'utf-8').includes('"private": false');
    } catch {
      return false;
    }
  });

  console.log(`📦 Packages to release: ${packages.join(', ')}`);

  // Get current version
  const currentVersion = getCurrentVersion(join(PACKAGES_DIR, 'core'));
  const newVersion = bumpVersion(currentVersion, type);
  
  console.log(`📈 Version bump: ${currentVersion} → ${newVersion}`);

  if (!dryRun) {
    // Run pre-release checks
    runTests();
    buildPackages();

    // Update versions
    console.log('📝 Updating package versions...');
    for (const pkg of packages) {
      const packagePath = join(PACKAGES_DIR, pkg);
      updatePackageVersion(packagePath, newVersion);
    }

    // Update changelog
    updateChangelog(newVersion, type, packages);

    // Create git tag
    createGitTag(newVersion);

    // Publish packages
    publishPackages(packages);

    console.log(`🎉 Release v${newVersion} completed successfully!`);
  } else {
    console.log(`🔍 Dry run complete. Would release v${newVersion}`);
  }
}

// Run release
release().catch(console.error);
