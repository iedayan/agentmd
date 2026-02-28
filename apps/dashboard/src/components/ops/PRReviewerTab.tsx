'use client';

import { useState } from 'react';
import { GitPullRequest, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PRReviewResult {
  id: string;
  prNumber: number;
  title: string;
  author: string;
  repo: string;
  overallScore: number;
  status: 'approved' | 'needs_attention' | 'blocked';
  criteria: {
    name: string;
    score: number;
    passed: boolean;
    feedback: string;
    suggestions: string[];
  }[];
  reviewedAt: string;
  duration: number;
}

const mockResults: PRReviewResult[] = [
  {
    id: '1',
    prNumber: 42,
    title: 'Add new authentication feature',
    author: 'john-doe',
    repo: 'agentmd/core',
    overallScore: 88,
    status: 'approved',
    criteria: [
      {
        name: 'Test Coverage',
        score: 90,
        passed: true,
        feedback: 'Test coverage looks adequate',
        suggestions: [],
      },
      {
        name: 'Build Success',
        score: 95,
        passed: true,
        feedback: 'Found 1 build command(s) in AGENTS.md',
        suggestions: [],
      },
      {
        name: 'Security Review',
        score: 100,
        passed: true,
        feedback: 'No security concerns detected',
        suggestions: [],
      },
      {
        name: 'Documentation',
        score: 85,
        passed: true,
        feedback: 'Documentation updated',
        suggestions: [],
      },
      {
        name: 'Code Style',
        score: 80,
        passed: true,
        feedback: 'Found 1 linting command(s) in AGENTS.md',
        suggestions: [],
      },
    ],
    reviewedAt: '2024-02-28T10:30:00Z',
    duration: 2.3,
  },
  {
    id: '2',
    prNumber: 41,
    title: 'Fix memory leak in data processor',
    author: 'jane-smith',
    repo: 'agentmd/analytics',
    overallScore: 65,
    status: 'needs_attention',
    criteria: [
      {
        name: 'Test Coverage',
        score: 30,
        passed: false,
        feedback: 'Source code changes detected but no test files were modified',
        suggestions: [
          'Add unit tests for new functionality',
          'Update existing tests to cover changed code',
        ],
      },
      {
        name: 'Build Success',
        score: 95,
        passed: true,
        feedback: 'Build commands passed successfully',
        suggestions: [],
      },
      {
        name: 'Security Review',
        score: 100,
        passed: true,
        feedback: 'No security concerns detected',
        suggestions: [],
      },
      {
        name: 'Documentation',
        score: 60,
        passed: false,
        feedback: 'No documentation updates for bug fix',
        suggestions: ['Update changelog', 'Document fix in README'],
      },
      {
        name: 'Code Style',
        score: 80,
        passed: true,
        feedback: 'Code style is consistent',
        suggestions: [],
      },
    ],
    reviewedAt: '2024-02-28T09:15:00Z',
    duration: 1.8,
  },
];

export function PRReviewerTab() {
  const [results, setResults] = useState(mockResults);
  const [selectedResult, setSelectedResult] = useState<PRReviewResult | null>(mockResults[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeNewPR = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/pr-reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: 'agentmd',
          repo: 'demo-repo',
          prNumber: Math.floor(Math.random() * 100) + 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new review to the list
        const newReview = {
          id: Date.now().toString(),
          prNumber: data.result.prData.changedFilesCount,
          title: data.result.prData.title,
          author: data.result.prData.author,
          repo: 'agentmd/demo-repo',
          overallScore: data.result.overallScore,
          status: data.result.status as 'approved' | 'needs_attention' | 'blocked',
          criteria: data.result.results.map((r: any, i: number) => ({
            name: [
              'Test Coverage',
              'Build Success',
              'Security Review',
              'Documentation',
              'Code Style',
            ][i],
            score: r.score,
            passed: r.passed,
            feedback: r.feedback,
            suggestions: r.suggestions || [],
          })),
          reviewedAt: data.result.reviewedAt,
          duration: data.result.duration,
        };

        setResults((prev) => [newReview, ...prev.slice(0, 9)]);
        setSelectedResult(newReview);
      } else {
        console.error('Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PR Reviewer</h2>
          <p className="text-muted-foreground">AI-powered pull request reviews using AGENTS.md</p>
        </div>
        <Button onClick={handleAnalyzeNewPR} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <GitPullRequest className="mr-2 h-4 w-4" />
              Analyze New PR
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
              <CardDescription>Latest PR analysis results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedResult?.id === result.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">#{result.prNumber}</span>
                    </div>
                    {getStatusIcon(result.status)}
                  </div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">{result.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{result.author}</span>
                    <span className={`text-xs font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}/100
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Review */}
        <div className="lg:col-span-2">
          {selectedResult ? (
            <div className="space-y-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GitPullRequest className="h-5 w-5" />#{selectedResult.prNumber}{' '}
                        {selectedResult.title}
                      </CardTitle>
                      <CardDescription>
                        {selectedResult.repo} • by {selectedResult.author} • Reviewed{' '}
                        {new Date(selectedResult.reviewedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedResult.status)}>
                      {selectedResult.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span
                        className={`text-2xl font-bold ${getScoreColor(selectedResult.overallScore)}`}
                      >
                        {selectedResult.overallScore}/100
                      </span>
                    </div>
                    <Progress value={selectedResult.overallScore} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Analysis completed in {selectedResult.duration}s</span>
                      <span>
                        {selectedResult.criteria.filter((c) => c.passed).length}/
                        {selectedResult.criteria.length} checks passed
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Criteria Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Criteria</CardTitle>
                  <CardDescription>Detailed breakdown of each review criterion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedResult.criteria.map((criterion, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {criterion.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">{criterion.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(criterion.score)}`}>
                              {criterion.score}/100
                            </span>
                            <Progress value={criterion.score} className="w-16 h-2" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{criterion.feedback}</p>
                        {criterion.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Suggestions:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {criterion.suggestions.map((suggestion, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a review to see details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
