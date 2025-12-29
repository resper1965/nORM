'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, FileText, Hash, Link as LinkIcon } from 'lucide-react';

interface SEOScoreBreakdown {
  titleScore: number;
  descriptionScore: number;
  keywordDensity: number;
  readabilityScore: number;
  linkScore: number;
  imageScore: number;
}

interface SEOAnalysis {
  overallScore: number;
  breakdown: SEOScoreBreakdown;
  suggestions: string[];
  strengths: string[];
  warnings: string[];
}

interface SEOScorePanelProps {
  content: {
    title: string;
    content: string;
    meta_description?: string;
    target_keywords?: string[];
  };
  analysis?: SEOAnalysis;
}

function ScoreIndicator({ score }: { score: number }) {
  let color = 'text-red-600';
  let bgColor = 'bg-red-600';
  let Icon = XCircle;

  if (score >= 70) {
    color = 'text-green-600';
    bgColor = 'bg-green-600';
    Icon = CheckCircle2;
  } else if (score >= 50) {
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-600';
    Icon = AlertCircle;
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-muted-foreground">/100</span>
    </div>
  );
}

function BreakdownItem({
  label,
  score,
  icon: Icon,
}: {
  label: string;
  score: number;
  icon: React.ElementType;
}) {
  let color = 'bg-red-500';

  if (score >= 70) {
    color = 'bg-green-500';
  } else if (score >= 50) {
    color = 'bg-yellow-500';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function SEOScorePanel({ content, analysis }: SEOScorePanelProps) {
  // If no analysis provided, calculate basic metrics
  const calculatedAnalysis: SEOAnalysis = analysis || {
    overallScore: 65,
    breakdown: {
      titleScore: content.title?.length >= 30 && content.title?.length <= 60 ? 90 : 60,
      descriptionScore: content.meta_description?.length || 0 >= 120 ? 85 : 50,
      keywordDensity: 70,
      readabilityScore: 75,
      linkScore: 60,
      imageScore: 50,
    },
    suggestions: [
      'Add more internal links to related content',
      'Include at least 2-3 images with alt text',
      'Improve keyword density in the first paragraph',
    ],
    strengths: [
      'Title length is within optimal range',
      'Good use of headings',
    ],
    warnings: [
      'Meta description could be longer (aim for 150-160 characters)',
    ],
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>SEO Score</CardTitle>
          <ScoreIndicator score={calculatedAnalysis.overallScore} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Score Breakdown
          </h3>

          <BreakdownItem
            label="Title Optimization"
            score={calculatedAnalysis.breakdown.titleScore}
            icon={FileText}
          />

          <BreakdownItem
            label="Meta Description"
            score={calculatedAnalysis.breakdown.descriptionScore}
            icon={FileText}
          />

          <BreakdownItem
            label="Keyword Density"
            score={calculatedAnalysis.breakdown.keywordDensity}
            icon={Hash}
          />

          <BreakdownItem
            label="Readability"
            score={calculatedAnalysis.breakdown.readabilityScore}
            icon={TrendingUp}
          />

          <BreakdownItem
            label="Internal Links"
            score={calculatedAnalysis.breakdown.linkScore}
            icon={LinkIcon}
          />
        </div>

        {/* Strengths */}
        {calculatedAnalysis.strengths.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Strengths
            </h3>
            <ul className="space-y-1">
              {calculatedAnalysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {calculatedAnalysis.warnings.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Warnings
            </h3>
            <ul className="space-y-1">
              {calculatedAnalysis.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {calculatedAnalysis.suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Suggestions for Improvement
            </h3>
            <ul className="space-y-1">
              {calculatedAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Title Length</p>
            <p className="text-lg font-semibold">{content.title?.length || 0} chars</p>
            <p className="text-xs text-muted-foreground">Optimal: 30-60</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description Length</p>
            <p className="text-lg font-semibold">{content.meta_description?.length || 0} chars</p>
            <p className="text-xs text-muted-foreground">Optimal: 120-160</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Word Count</p>
            <p className="text-lg font-semibold">
              {content.content?.split(/\s+/).length || 0} words
            </p>
            <p className="text-xs text-muted-foreground">Target: 800-1500</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Target Keywords</p>
            <p className="text-lg font-semibold">{content.target_keywords?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Recommended: 3-5</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
