import React, { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { getGlossaryTerm, getRelatedTerms, type GlossaryTerm } from "@/lib/legalGlossary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LegalTermTooltipProps {
  termId: string;
  showIcon?: boolean;
  className?: string;
  variant?: "inline" | "icon" | "badge";
}

/**
 * Smart tooltip component for legal terms
 * Displays definitions, plain English explanations, and examples
 */
export function LegalTermTooltip({
  termId,
  showIcon = true,
  className = "",
  variant = "icon",
}: LegalTermTooltipProps) {
  const term = getGlossaryTerm(termId);
  const [showDetails, setShowDetails] = useState(false);

  if (!term) {
    return null;
  }

  const relatedTerms = getRelatedTerms(termId);

  const tooltipContent = (
    <div className="max-w-sm space-y-3 p-2">
      {/* Term Title */}
      <div>
        <h4 className="font-semibold text-sm text-foreground">{term.term}</h4>
        <Badge variant="secondary" className="mt-1 text-xs">
          {term.category}
        </Badge>
      </div>

      {/* Plain English Explanation */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">In Plain English:</p>
        <p className="text-sm text-foreground">{term.plainEnglish}</p>
      </div>

      {/* Example */}
      {term.example && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Example:</p>
          <p className="text-sm italic text-foreground">{term.example}</p>
        </div>
      )}

      {/* Legal Definition */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Legal Definition:</p>
        <p className="text-sm text-foreground">{term.definition}</p>
      </div>

      {/* Source */}
      {term.source && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Source:</p>
          <p className="text-xs text-foreground">{term.source}</p>
        </div>
      )}

      {/* Related Terms */}
      {relatedTerms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Related Terms:</p>
          <div className="flex flex-wrap gap-1">
            {relatedTerms.map(relatedTerm => (
              <Badge key={relatedTerm.id} variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                {relatedTerm.term}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`underline decoration-dotted cursor-help ${className}`}>
              {term.term}
              {showIcon && <HelpCircle className="inline ml-1 w-3 h-3" />}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="w-80 p-0 bg-background border">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-help">
              {term.term}
              {showIcon && <HelpCircle className="ml-1 w-3 h-3" />}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="right" className="w-80 p-0 bg-background border">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default: icon variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ${className}`}
            aria-label={`Learn more about ${term.term}`}
          >
            <HelpCircle className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-80 p-0 bg-background border">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Expandable legal term card for help panels
 */
export function LegalTermCard({ termId }: { termId: string }) {
  const term = getGlossaryTerm(termId);
  const [isExpanded, setIsExpanded] = useState(false);
  const relatedTerms = getRelatedTerms(termId);

  if (!term) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{term.term}</h3>
            <Badge variant="secondary" className="text-xs">
              {term.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{term.plainEnglish}</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-muted-foreground hover:text-foreground"
          aria-label="Expand details"
        >
          {isExpanded ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 pt-4 border-t">
          {term.example && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Example:</p>
              <p className="text-sm italic">{term.example}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Legal Definition:</p>
            <p className="text-sm">{term.definition}</p>
          </div>

          {term.source && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Source:</p>
              <p className="text-xs text-muted-foreground">{term.source}</p>
            </div>
          )}

          {relatedTerms.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Related Terms:</p>
              <div className="flex flex-wrap gap-1">
                {relatedTerms.map(relatedTerm => (
                  <Badge key={relatedTerm.id} variant="outline" className="text-xs">
                    {relatedTerm.term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
