import fs from 'fs';
import path from 'path';

const SRC_DIR = '/Users/iedayan/Documents/agentsmd/apps/dashboard/src';

const pathMappings = {
    // Components
    "@/components/theme-provider": "@/components/providers/theme-provider",
    "@/components/chunk-reload-guard": "@/components/providers/chunk-reload-guard",
    "@/components/theme-toggle": "@/components/ui/theme-toggle",

    // Lib - Auth
    "@/lib/auth": "@/lib/auth/auth",
    "@/lib/session": "@/lib/auth/session",

    // Lib - Data
    "@/lib/db": "@/lib/data/db",
    "@/lib/data-layer": "@/lib/data/data-layer",
    "@/lib/data-layer-in-memory": "@/lib/data/data-layer-in-memory",
    "@/lib/dashboard-data": "@/lib/data/dashboard-data",
    "@/lib/dashboard-data-db": "@/lib/data/dashboard-data-db",
    "@/lib/dashboard-data-facade": "@/lib/data/dashboard-data-facade",
    "@/lib/server-persistence": "@/lib/data/server-persistence",

    // Lib - Billing
    "@/lib/stripe": "@/lib/billing/stripe",
    "@/lib/stripe-connect": "@/lib/billing/stripe-connect",
    "@/lib/plans": "@/lib/billing/plans",

    // Lib - Integrations
    "@/lib/github-app": "@/lib/integrations/github-app",
    "@/lib/external-notifier": "@/lib/integrations/external-notifier",
    "@/lib/integration-events": "@/lib/integrations/integration-events",

    // Lib - Analytics
    "@/lib/governance-data": "@/lib/analytics/governance-data",
    "@/lib/reliability-data": "@/lib/analytics/reliability-data",
    "@/lib/impact": "@/lib/analytics/impact",
    "@/lib/insights": "@/lib/analytics/insights",

    // Lib - Core
    "@/lib/job-queue": "@/lib/core/job-queue",
    "@/lib/rate-limit": "@/lib/core/rate-limit",
    "@/lib/public-url": "@/lib/core/public-url",
    "@/lib/request-context": "@/lib/core/request-context",
    "@/lib/api-response": "@/lib/core/api-response",
    "@/lib/utils": "@/lib/core/utils",

    // Lib - Agents
    "@/lib/agents-md-templates": "@/lib/agents/agents-md-templates",
    "@/lib/migrate-to-agents-md": "@/lib/agents/migrate-to-agents-md",
};

// Function to recursively find all .ts and .tsx files
function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allFiles = findFiles(SRC_DIR);
let updatedFilesCount = 0;

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [oldPath, newPath] of Object.entries(pathMappings)) {
        // Replace imports with quotes: from "@/lib/utils" -> from "@/lib/core/utils"
        // Handle both single and double quotes
        const regexDouble = new RegExp(`(["'])${oldPath}(["'])`, 'g');
        content = content.replace(regexDouble, `$1${newPath}$2`);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFilesCount++;
    }
}

console.log(`Updated imports in ${updatedFilesCount} files.`);
