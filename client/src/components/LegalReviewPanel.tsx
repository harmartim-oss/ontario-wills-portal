import React, { useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LegalSource {
  title: string;
  type: 'case' | 'statute' | 'article';
  citation: string;
  url: string;
  year?: number;
  court?: string;
  summary: string;
}

interface WordingSuggestion {
  original_text: string;
  suggested_text: string;
  reason: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
}

interface ComplianceIssue {
  issue_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  risk_factors: string[];
  sources: LegalSource[];
  suggested_fixes: WordingSuggestion[];
  case_law_references: string[];
}

interface LegalReviewPanelProps {
  issues: ComplianceIssue[];
  summary: string;
  overall_risk_level: 'critical' | 'high' | 'medium' | 'low';
  onAcceptSuggestion?: (suggestion: WordingSuggestion) => void;
  onRejectSuggestion?: (suggestion: WordingSuggestion) => void;
  isLoading?: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'high':
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    case 'medium':
      return <Info className="w-5 h-5 text-yellow-600" />;
    case 'low':
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

const SourceLink: React.FC<{ source: LegalSource }> = ({ source }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {source.type === 'case' ? '⚖️ Case' : source.type === 'statute' ? '📋 Statute' : '📄 Article'}
        </span>
        {source.year && <span className="text-xs text-slate-500">({source.year})</span>}
      </div>
      <p className="font-semibold text-sm text-slate-900 mb-1">{source.title}</p>
      <p className="text-xs text-slate-600 mb-2">{source.citation}</p>
      {source.court && <p className="text-xs text-slate-500 mb-2">Court: {source.court}</p>}
      {source.summary && <p className="text-sm text-slate-700 mb-2">{source.summary}</p>}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View Source <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </div>
);

const WordingSuggestionCard: React.FC<{
  suggestion: WordingSuggestion;
  onAccept?: () => void;
  onReject?: () => void;
}> = ({ suggestion, onAccept, onReject }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors">
    <div className="mb-3">
      <Badge variant="outline" className={`mb-2 ${getSeverityColor(suggestion.risk_level)}`}>
        {suggestion.risk_level.toUpperCase()} RISK
      </Badge>
      <p className="text-sm font-semibold text-slate-900 mb-2">Reason: {suggestion.reason}</p>
    </div>

    <div className="space-y-3 mb-4">
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Current Wording:</p>
        <p className="text-sm text-slate-700 italic p-2 bg-slate-100 rounded border-l-4 border-slate-300">
          "{suggestion.original_text}"
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Suggested Wording:</p>
        <p className="text-sm text-slate-700 italic p-2 bg-green-50 rounded border-l-4 border-green-300">
          "{suggestion.suggested_text}"
        </p>
      </div>
    </div>

    {(onAccept || onReject) && (
      <div className="flex gap-2">
        {onAccept && (
          <Button
            size="sm"
            onClick={onAccept}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Accept Suggestion
          </Button>
        )}
        {onReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            className="text-slate-600"
          >
            Reject
          </Button>
        )}
      </div>
    )}
  </div>
);

const ComplianceIssueCard: React.FC<{ issue: ComplianceIssue }> = ({ issue }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`border-2 ${getSeverityColor(issue.severity)}`}>
      <CardHeader
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getSeverityIcon(issue.severity)}
            <div className="flex-1">
              <CardTitle className="text-lg">{issue.title}</CardTitle>
              <CardDescription className="mt-1">{issue.description}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 pt-0">
          {/* Risk Factors */}
          {issue.risk_factors.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-2">Risk Factors:</h4>
              <ul className="space-y-1">
                {issue.risk_factors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Sources */}
          {issue.sources.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-3">Legal Sources & References:</h4>
              <div className="space-y-2">
                {issue.sources.map((source, idx) => (
                  <SourceLink key={idx} source={source} />
                ))}
              </div>
            </div>
          )}

          {/* Suggested Fixes */}
          {issue.suggested_fixes.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-3">Suggested Wording Improvements:</h4>
              <div className="space-y-3">
                {issue.suggested_fixes.map((fix, idx) => (
                  <WordingSuggestionCard key={idx} suggestion={fix} />
                ))}
              </div>
            </div>
          )}

          {/* Case Law References */}
          {issue.case_law_references.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-2">Case Law References:</h4>
              <ul className="space-y-1">
                {issue.case_law_references.map((ref, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export const LegalReviewPanel: React.FC<LegalReviewPanelProps> = ({
  issues,
  summary,
  overall_risk_level,
  isLoading = false,
}) => {
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  const lowCount = issues.filter(i => i.severity === 'low').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-slate-600"></div>
            <p className="text-slate-600">Analyzing document for legal compliance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={`border-2 ${getSeverityColor(overall_risk_level)}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getSeverityIcon(overall_risk_level)}
            <div className="flex-1">
              <CardTitle>Legal Compliance Review</CardTitle>
              <CardDescription className="mt-1">
                Overall Risk Level: <span className="font-semibold text-slate-900">{overall_risk_level.toUpperCase()}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">{summary}</p>

          {/* Issue Statistics */}
          <div className="grid grid-cols-4 gap-2">
            {criticalCount > 0 && (
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-semibold text-red-700">CRITICAL</p>
                <p className="text-lg font-bold text-red-600">{criticalCount}</p>
              </div>
            )}
            {highCount > 0 && (
              <div className="p-2 bg-orange-50 rounded border border-orange-200">
                <p className="text-xs font-semibold text-orange-700">HIGH</p>
                <p className="text-lg font-bold text-orange-600">{highCount}</p>
              </div>
            )}
            {mediumCount > 0 && (
              <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-700">MEDIUM</p>
                <p className="text-lg font-bold text-yellow-600">{mediumCount}</p>
              </div>
            )}
            {lowCount > 0 && (
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs font-semibold text-blue-700">LOW</p>
                <p className="text-lg font-bold text-blue-600">{lowCount}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues Tabs */}
      {issues.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
            {criticalCount > 0 && <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>}
            {highCount > 0 && <TabsTrigger value="high">High ({highCount})</TabsTrigger>}
            {mediumCount > 0 && <TabsTrigger value="medium">Medium ({mediumCount})</TabsTrigger>}
            {lowCount > 0 && <TabsTrigger value="low">Low ({lowCount})</TabsTrigger>}
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {issues.map((issue, idx) => (
              <ComplianceIssueCard key={idx} issue={issue} />
            ))}
          </TabsContent>

          {criticalCount > 0 && (
            <TabsContent value="critical" className="space-y-4 mt-4">
              {issues
                .filter(i => i.severity === 'critical')
                .map((issue, idx) => (
                  <ComplianceIssueCard key={idx} issue={issue} />
                ))}
            </TabsContent>
          )}

          {highCount > 0 && (
            <TabsContent value="high" className="space-y-4 mt-4">
              {issues
                .filter(i => i.severity === 'high')
                .map((issue, idx) => (
                  <ComplianceIssueCard key={idx} issue={issue} />
                ))}
            </TabsContent>
          )}

          {mediumCount > 0 && (
            <TabsContent value="medium" className="space-y-4 mt-4">
              {issues
                .filter(i => i.severity === 'medium')
                .map((issue, idx) => (
                  <ComplianceIssueCard key={idx} issue={issue} />
                ))}
            </TabsContent>
          )}

          {lowCount > 0 && (
            <TabsContent value="low" className="space-y-4 mt-4">
              {issues
                .filter(i => i.severity === 'low')
                .map((issue, idx) => (
                  <ComplianceIssueCard key={idx} issue={issue} />
                ))}
            </TabsContent>
          )}
        </Tabs>
      )}

      {issues.length === 0 && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">No Compliance Issues Found</p>
                <p className="text-sm text-green-700">Your document appears to comply with Ontario legal requirements.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalReviewPanel;
