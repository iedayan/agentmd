#!/usr/bin/env node

/**
 * AgentMD Usage Analytics
 * Analyzes usage patterns and generates insights.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

/**
 * Usage data interface
 */
class UsageData {
  constructor(timestamp, eventType, properties) {
    this.timestamp = timestamp;
    this.eventType = eventType;
    this.properties = properties;
  }
}

/**
 * Parse analytics log file
 */
function parseAnalyticsLog(logPath) {
  try {
    const content = readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    return lines.map(line => {
      try {
        const data = JSON.parse(line);
        return new UsageData(
          data.timestamp,
          data.event,
          data.properties
        );
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Generate usage insights
 */
function generateInsights(usageData) {
  const insights = {
    totalEvents: usageData.length,
    uniqueUsers: new Set(),
    eventTypes: {},
    dailyUsage: {},
    featureUsage: {},
    editorUsage: {},
    templateUsage: {},
    securityEvents: 0,
  };
  
  usageData.forEach(data => {
    // Count unique users
    if (data.properties?.userId) {
      insights.uniqueUsers.add(data.properties.userId);
    }
    
    // Count event types
    insights.eventTypes[data.eventType] = (insights.eventTypes[data.eventType] || 0) + 1;
    
    // Daily usage
    const date = new Date(data.timestamp).toISOString().split('T')[0];
    insights.dailyUsage[date] = (insights.dailyUsage[date] || 0) + 1;
    
    // Feature usage
    if (data.eventType === 'agents_md_validated') {
      const scoreRange = data.properties?.score_range || 'unknown';
      insights.featureUsage[scoreRange] = (insights.featureUsage[scoreRange] || 0) + 1;
    }
    
    // Editor usage
    if (data.eventType === 'editor_usage') {
      const editor = data.properties?.editor || 'unknown';
      insights.editorUsage[editor] = (insights.editorUsage[editor] || 0) + 1;
    }
    
    // Template usage
    if (data.eventType === 'template_used') {
      const framework = data.properties?.framework || 'unknown';
      insights.templateUsage[framework] = (insights.templateUsage[framework] || 0) + 1;
    }
    
    // Security events
    if (data.eventType === 'security_event') {
      insights.securityEvents++;
    }
  });
  
  insights.uniqueUsers = insights.uniqueUsers.size;
  return insights;
}

/**
 * Generate report
 */
function generateReport(insights) {
  const report = [];
  
  report.push('# AgentMD Usage Analytics Report');
  report.push('');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');
  
  // Overview
  report.push('## Overview');
  report.push('');
  report.push(`- **Total Events**: ${insights.totalEvents.toLocaleString()}`);
  report.push(`- **Unique Users**: ${insights.uniqueUsers.toLocaleString()}`);
  report.push(`- **Security Events**: ${insights.securityEvents}`);
  report.push('');
  
  // Event Types
  report.push('## Event Types');
  report.push('');
  report.push('| Event Type | Count | Percentage |');
  report.push('|------------|-------|------------|');
  
  const sortedEvents = Object.entries(insights.eventTypes)
    .sort(([,a], [,b]) => b - a);
  
  sortedEvents.forEach(([eventType, count]) => {
    const percentage = ((count / insights.totalEvents) * 100).toFixed(1);
    report.push(`| ${eventType} | ${count.toLocaleString()} | ${percentage}% |`);
  });
  
  report.push('');
  
  // Daily Usage
  report.push('## Daily Usage Trend');
  report.push('');
  report.push('| Date | Events |');
  report.push('|------|--------|');
  
  const sortedDays = Object.entries(insights.dailyUsage)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30); // Last 30 days
  
  sortedDays.forEach(([date, count]) => {
    report.push(`| ${date} | ${count.toLocaleString()} |`);
  });
  
  report.push('');
  
  // Feature Usage
  if (Object.keys(insights.featureUsage).length > 0) {
    report.push('## Feature Usage (Validation Scores)');
    report.push('');
    report.push('| Score Range | Count | Percentage |');
    report.push('|-------------|-------|------------|');
    
    const sortedScores = Object.entries(insights.featureUsage)
      .sort(([,a], [,b]) => b - a);
    
    sortedScores.forEach(([scoreRange, count]) => {
      const percentage = ((count / insights.totalEvents) * 100).toFixed(1);
      report.push(`| ${scoreRange} | ${count.toLocaleString()} | ${percentage}% |`);
    });
    
    report.push('');
  }
  
  // Editor Usage
  if (Object.keys(insights.editorUsage).length > 0) {
    report.push('## Editor Usage');
    report.push('');
    report.push('| Editor | Count | Percentage |');
    report.push('|--------|-------|------------|');
    
    const sortedEditors = Object.entries(insights.editorUsage)
      .sort(([,a], [,b]) => b - a);
    
    sortedEditors.forEach(([editor, count]) => {
      const percentage = ((count / insights.totalEvents) * 100).toFixed(1);
      report.push(`| ${editor} | ${count.toLocaleString()} | ${percentage}% |`);
    });
    
    report.push('');
  }
  
  // Template Usage
  if (Object.keys(insights.templateUsage).length > 0) {
    report.push('## Template Usage');
    report.push('');
    report.push('| Framework | Count | Percentage |');
    report.push('|----------|-------|------------|');
    
    const sortedTemplates = Object.entries(insights.templateUsage)
      .sort(([,a], [,b]) => b - a);
    
    sortedTemplates.forEach(([framework, count]) => {
      const percentage = ((count / insights.totalEvents) * 100).toFixed(1);
      report.push(`| ${framework} | ${count.toLocaleString()} | ${percentage}% |`);
    });
    
    report.push('');
  }
  
  // Insights and Recommendations
  report.push('## Insights & Recommendations');
  report.push('');
  
  // User engagement
  const avgEventsPerUser = insights.totalEvents / insights.uniqueUsers;
  report.push(`### User Engagement`);
  report.push(`- Average events per user: ${avgEventsPerUser.toFixed(1)}`);
  
  if (avgEventsPerUser < 10) {
    report.push('- ⚠️ Low user engagement - consider improving onboarding');
  } else if (avgEventsPerUser > 50) {
    report.push('- ✅ High user engagement - users are actively using features');
  }
  
  // Security
  if (insights.securityEvents > 0) {
    report.push(`### Security`);
    report.push(`- ${insights.securityEvents} security events detected`);
    report.push('- 🔍 Review security events for patterns and improvements');
  }
  
  // Popular features
  const topEvent = sortedEvents[0];
  if (topEvent) {
    report.push(`### Popular Features`);
    report.push(`- Most used feature: ${topEvent[0]} (${topEvent[1].toLocaleString()} events)`);
    report.push('- 💡 Consider enhancing popular features');
  }
  
  // Editor preferences
  if (Object.keys(insights.editorUsage).length > 0) {
    const topEditor = Object.entries(insights.editorUsage)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topEditor) {
      report.push(`### Editor Preferences`);
      report.push(`- Most popular editor: ${topEditor[0]}`);
      report.push('- 🎯 Focus integration efforts on popular editors');
    }
  }
  
  // Template preferences
  if (Object.keys(insights.templateUsage).length > 0) {
    const topTemplate = Object.entries(insights.templateUsage)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topTemplate) {
      report.push(`### Template Preferences`);
      report.push(`- Most used template: ${topTemplate[0]}`);
      report.push('- 📝 Create more templates for popular frameworks');
    }
  }
  
  return report.join('\n');
}

/**
 * Main analytics function
 */
async function runAnalytics() {
  console.log('📊 AgentMD Usage Analytics\n');
  
  // Look for analytics log file
  const logPath = join(ROOT_DIR, 'analytics.log');
  const usageData = parseAnalyticsLog(logPath);
  
  if (usageData.length === 0) {
    console.log('ℹ️  No analytics data found');
    console.log('💡 Enable analytics tracking to collect usage data');
    return;
  }
  
  console.log(`📈 Analyzing ${usageData.length} events...`);
  
  // Generate insights
  const insights = generateInsights(usageData);
  
  // Generate report
  const report = generateReport(insights);
  
  // Save report
  const reportPath = join(ROOT_DIR, 'USAGE_ANALYTICS.md');
  writeFileSync(reportPath, report);
  
  console.log(`✅ Analytics report saved to ${reportPath}`);
  
  // Display summary
  console.log('\n📊 Summary');
  console.log('─'.repeat(30));
  console.log(`Total Events: ${insights.totalEvents.toLocaleString()}`);
  console.log(`Unique Users: ${insights.uniqueUsers.toLocaleString()}`);
  console.log(`Event Types: ${Object.keys(insights.eventTypes).length}`);
  console.log(`Security Events: ${insights.securityEvents}`);
  
  if (Object.keys(insights.editorUsage).length > 0) {
    const topEditor = Object.entries(insights.editorUsage)
      .sort(([,a], [,b]) => b - a)[0];
    console.log(`Top Editor: ${topEditor[0]}`);
  }
  
  if (Object.keys(insights.templateUsage).length > 0) {
    const topTemplate = Object.entries(insights.templateUsage)
      .sort(([,a], [,b]) => b - a)[0];
    console.log(`Top Template: ${topTemplate[0]}`);
  }
}

// Run analytics
runAnalytics().catch(console.error);
