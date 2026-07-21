import React from "react";
import { Label } from "@/components/ui/label";
import { LegalTermTooltip } from "./LegalTermTooltip";
import { getTermsForQuestion, getHighlightedPhrase } from "@/lib/questionTermMapping";

interface QuestionWithTooltipsProps {
  questionId: string;
  label: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

/**
 * Wrapper component for form questions that automatically adds legal term tooltips
 * Displays help icons for complex legal terms in the question label
 */
export function QuestionWithTooltips({
  questionId,
  label,
  description,
  children,
  required = false,
}: QuestionWithTooltipsProps) {
  const terms = getTermsForQuestion(questionId);
  const highlightedPhrase = getHighlightedPhrase(questionId);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-base">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {/* Show tooltips for associated terms */}
        {terms.length > 0 && (
          <div className="flex gap-1">
            {terms.slice(0, 2).map(termId => (
              <LegalTermTooltip
                key={termId}
                termId={termId}
                variant="icon"
                showIcon={true}
              />
            ))}
            {terms.length > 2 && (
              <span className="text-xs text-muted-foreground px-2 py-1 bg-blue-50 rounded">
                +{terms.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">
          {highlightedPhrase && (
            <>
              <span className="font-medium text-foreground">{highlightedPhrase}</span>
              {": "}
            </>
          )}
          {description}
        </p>
      )}

      <div className="mt-3">
        {children}
      </div>
    </div>
  );
}

/**
 * Inline question label with embedded term tooltips
 * Useful for complex questions with multiple legal terms
 */
export function QuestionLabelWithTerms({
  questionId,
  label,
  required = false,
}: {
  questionId: string;
  label: string;
  required?: boolean;
}) {
  const terms = getTermsForQuestion(questionId);

  return (
    <div className="flex items-center gap-2">
      <Label className="text-base">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {terms.length > 0 && (
        <div className="flex gap-1">
          {terms.map(termId => (
            <LegalTermTooltip
              key={termId}
              termId={termId}
              variant="icon"
              showIcon={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Display all terms for a question in a help section
 */
export function QuestionTermsHelp({ questionId }: { questionId: string }) {
  const terms = getTermsForQuestion(questionId);

  if (terms.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs font-medium text-blue-900 mb-2">Legal Terms in This Question:</p>
      <div className="flex flex-wrap gap-2">
        {terms.map(termId => (
          <LegalTermTooltip
            key={termId}
            termId={termId}
            variant="badge"
            showIcon={true}
          />
        ))}
      </div>
    </div>
  );
}
